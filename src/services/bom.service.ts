import ejs from "ejs";
import { Op } from "sequelize";
import puppeteer from 'puppeteer';

import {
  HttpException,
  ConflictHttpException,
  NotFoundHttpException,
  BadRequestHttpException,
  UnauthorizedHttpException,
} from "@/exceptions/HttpException";
import UserDaos from "@/daos/user.daos";
import { logger } from "@/utils/logger";
import EmailService from "@/utils/email";
import { message } from "@/utils/message";
import BomFormDataDao from "@/daos/bom.daos";
import { approveBomReqData } from "@utils/bom.type";
import { statusEnum, roleEnum } from "@/utils/enum";
import BomApprovalDao from "@/daos/bom-approval.daos";
import { ResponseFormat } from "@/exceptions/responseFormat";
import { BomApproval } from "@/interfaces/bom-approval.interface";
import { NotificationSubject } from "@/utils/notification.subject";
import { BomHierarchyInterface } from "@/interfaces/bom.hierarchy.interface";
import { MixedBomFormDataInterface } from "@/interfaces/mixedBomFormData.interface";
import {
  documentWhereCondition,
  documentPlantWhereCondition,
} from "@utils/bom.type";
import {
  BomDetailsResponse,
  BomGetApprovalData,
  BomQueryFilter,
} from "@interfaces/bom.get.approval.interface";
import { getBomPdfHtml } from "@/utils/pdf-html/bom.pdf";
import { ValidateNested } from "class-validator";
class BomService {
  public emailService = new EmailService();
  public bomFormDataDao = new BomFormDataDao();
  public bomApprovalDao = new BomApprovalDao();

  public responseFormat = new ResponseFormat();
  public userDaos = new UserDaos();

  /**
   *
   * @param payload
   * @returns
   */
  public performInsertOperation = async (
    payload: MixedBomFormDataInterface
  ) => {
    const { bomDetails, bomForm, userId, plantId, image, googleSheetLink, id, createNewVersion, drawing } = payload;

    try {
      logger.info({
        message: "Inserting data into Bom FormData Table",
        context: "BomService",
        method: "performInsertOperation",
      });

      const generatedBomId = await this.bomFormDataDao.generateBomId();
      logger.info(`Unique bom id is: ${generatedBomId}`);

      let insertResponse;
      const isCreateNewVersion = createNewVersion === 'true';

      // Create new version of an existing BOM
      if (id && isCreateNewVersion) {
        const getBomDetails = await this.bomFormDataDao.get(id);
        const previousVersion = parseFloat(getBomDetails.version);
        const newVersion = (previousVersion + 1.0).toFixed(1);
        const currentRevNo = parseInt(getBomDetails.revNo, 10); //convert string to number
        const newRevNo = String(currentRevNo + 1).padStart(2, '0');

        bomDetails.version = newVersion;
        bomDetails.parentBomId = id;
        bomDetails.bomId = generatedBomId;
        bomDetails.plantId = plantId;
        bomDetails.userId = userId;
        bomDetails.googleSheetLink = googleSheetLink;
        bomDetails.revNo = newRevNo

        const newBom = await this.bomFormDataDao.create(bomDetails, image, drawing);
        if (!newBom) {
          throw new BadRequestHttpException(message.bom.errorInCreatingBOM);
        }

        const bomFormData = bomForm.map((element) => ({
          ...element,
          bomId: newBom.id,
        }));
        await this.bomFormDataDao.createBomFormDataBulk(bomFormData);

        const allForms = await this.bomFormDataDao.bomFormData.findAll({
          where: { bomId: newBom.id },
        });

        insertResponse = {
          bomDetails: await this.bomFormDataDao.bom.findByPk(newBom.id),
          bomForm: allForms.map((form) => form.toJSON()).sort((a, b) => Number(a.sNo) - Number(b.sNo)),
        };
      }

      //  Update existing BOM
      else if (id) {
        insertResponse = await this.bomFormDataDao.createOrUpdate(id, {
          bomDetails,
          bomForm,
          image,
          drawing
        });

        if (!insertResponse) {
          throw new BadRequestHttpException("Failed to update BOM details.");
        }
      }

      // Create new BOM from scratch
      else {
        bomDetails.bomId = generatedBomId;
        bomDetails.plantId = plantId;
        bomDetails.userId = userId;
        bomDetails.googleSheetLink = googleSheetLink;

        const createdBom = await this.bomFormDataDao.create(bomDetails, image, drawing);
        if (!createdBom) {
          throw new BadRequestHttpException(message.bom.errorInCreatingBOM);
        }

        const bomFormData = bomForm.map((element) => ({
          ...element,
          bomId: createdBom.id,
        }));
        await this.bomFormDataDao.createBomFormDataBulk(bomFormData);

        const allForms = await this.bomFormDataDao.bomFormData.findAll({
          where: { bomId: createdBom.id },
        });

        insertResponse = {
          bomDetails: await this.bomFormDataDao.bom.findByPk(createdBom.id),
          bomForm: allForms.map((form) => form.toJSON()).sort((a, b) => Number(a.sNo) - Number(b.sNo)),
        };
      }
      // Run approval setup ONLY if it's a new BOM or a new version
      if (!id || isCreateNewVersion) {
        // Approval Hierarchy Setup
        const userData = await this.userDaos.findById(userId);
        if (!userData) {
          throw new BadRequestHttpException(message.users.userNotExists);
        }

        const approvalHierarchy = await this.bomFormDataDao.getBomHierarchyByPlantId(plantId);
        if (!approvalHierarchy || !approvalHierarchy[0]?.dataValues?.BomHierarchyModels) {
          throw new BadRequestHttpException(message.bom.bomHierarchyDataNotFound);
        }

        const approvalData = [];
        for (const hierarchy of approvalHierarchy[0].dataValues.BomHierarchyModels) {
          const emailData = {
            approverName: hierarchy.UserModel.name,
            bomDocumentName: insertResponse.bomDetails.mainPartCode,
            bomDocumentId: insertResponse.bomDetails.bomId,
            bomDocumentCreateDate: new Date().toISOString(),
            submittedBy: userData.name,
          };

          const templatePath =
            hierarchy.level === 1
              ? `${process.cwd()}/src/template/bom.firstlevel.approver.ejs`
              : `${process.cwd()}/src/template/bom.creation.ejs`;

          await this.emailService.sendMail({
            emailTo: hierarchy.UserModel.email,
            subject: NotificationSubject.ESCALATION,
            html: await ejs.renderFile(templatePath, emailData),
          });

          approvalData.push({
            approverId: hierarchy.UserModel.id,
            bomId: insertResponse.bomDetails.id,
            totalApproverLevel: approvalHierarchy[0].dataValues.BomHierarchyModels.length,
            currentApproverLevel: hierarchy.level,
            bomHierarchyId: hierarchy.id,
          });
        }

        await this.bomFormDataDao.createBulkApproval(approvalData);
      }

      logger.info({
        message: "BOM creation process completed successfully",
        context: "BomService",
        method: "performInsertOperation",
      });

      return insertResponse;

    } catch (error) {
      logger.error({
        message: `Error occurred while inserting data into BOM FormData Table: ${error.message}`,
        context: "BomService",
        method: "performInsertOperation",
      });
      throw error;
    }
  };

  /**
   *
   * @param id
   * @returns
   */
  public getById = async (id: string) => {
    try {
      logger.info({
        message: "Fetching Data in Bom FormData Table statrtd",
        context: "BomService",
        method: "GET",
        data: id,
      });
      const data = await this.bomFormDataDao.getById(id, true);
      if (!data.length) {
        logger.error(`BOM data not found for this particular id: ${id}`);

        throw new NotFoundHttpException(message.bom.bomDataNotFound);
      }
      logger.info({
        message: "Fetching Data in Bom FormData Table ended",
        context: "BomService",
        method: "GET",
        data: id,
      });
      return data;
    } catch (error) {
      logger.error({
        message: "Error in fetching Data in Bom FormData Table",
        context: "BomService",
        method: "GET",
      });
      throw error;
    }
  };

  /**
   *
   * @param data
   * @returns
   */
  public findAll = async (userId, payload) => {
    try {
      logger.info({
        message: "Fetching Data in Bom FormData Table with filter is statrtd",
        context: "BomService",
        method: "GET",
        data: { userId, payload },
      });
      const {
        status = statusEnum.PENDING,
        page = 1,
        pageSize = 10,
        sortBy = "createdAt",
        sortOrder = "ASC",
      } = payload;
      const offset = (page - 1) * +pageSize;
      const data = await this.bomFormDataDao.filterData(
        { userId, status },
        +pageSize,
        offset,
        sortBy,
        sortOrder
      );
      const { rows, count } = data;
      if (!rows.length && !count) {
        logger.error(
          `BOM data not found for this particular approver id: ${userId}. Data: ${JSON.stringify(
            data
          )}`
        );
        throw new NotFoundHttpException(message.bom.bomDataNotFound);
      }
      logger.info({
        message: "Fetching Data in Bom FormData Table with filter is ended",
        context: "BomService",
        method: "GET",
      });
      return { bomData: rows, count, page: +page, pageSize: +pageSize };
    } catch (error) {
      logger.error({
        message: "Error in fetching Data in Bom FormData Table",
        context: "BomService",
        method: "GET",
      });
      throw error;
    }
  };

  /**
   *
   * @param id
   * @param data
   * @returns
   */
  public update = async (id: string, data: any) => {
    try {
      logger.info({
        message: "Updating Data in Bom FormData Table started",
        context: "BomService",
        method: "UPDATE",
      });
      const { bomForm } = data;
      const insertBomFormData = await this.bomFormDataDao.insertBomFormData(bomForm)
      await this.bomFormDataDao.update(id, { submissionStatus: data.submissionStatus })
      return await this.bomFormDataDao.getById(id, true);
    } catch (error) {
      logger.error({
        message: "Error in fetching Data in Bom FormData Table",
        context: "BomService",
        method: "UPDATE",
      });
      throw error;
    }
  };

  /**
   *
   * @param id
   * @returns
   */
  public deleteBom = async (id: string, child = false) => {
    try {
      logger.info({
        message: "Delete Data in Bom FormData Table statrtd",
        context: "BomService",
        method: "DELETE",
      });

      if (child) {
        logger.info(`Only delete  bom formData because child is: ${child}`);
        return await this.bomFormDataDao.deleteFormData(null, id);
      }
      const data = await this.bomFormDataDao.getById(id);
      if (!data.length) {
        logger.error(`BOM data not found for this particular id: ${id}`);
        throw new NotFoundHttpException(message.bom.bomDataNotFound);
      }
      await this.bomFormDataDao.deleteFormData(id, null);
      await this.bomFormDataDao.deleteBomApprovalWithBomId(id);
      return await this.bomFormDataDao.delete(id);
    } catch (error) {
      logger.error({
        message: "Error in Deleting Data in Bom FormData Table",
        context: "BomService",
        method: "DELETE",
      });
      throw error;
    }
  };

  /**
   *
   * @param id
   * @param payload
   * @returns
   */
  public approveBom = async (id: string, payload: any) => {
    try {
      logger.info({
        message: "Approval started",
        context: "BomService",
        method: "PUT",
      });
      const data = await this.bomFormDataDao.getBomApproval(id);
      if (!data.length) {
        logger.error(`BOM data not found for this particular id: ${id}`);
        throw new NotFoundHttpException(message.bom.bomDataNotFound);
      }

      const { currentApproverLevel, totalApproverLevel } = data[0];
      const { bomId, status, comments } = payload;

      const bomApprovalData = await this.bomFormDataDao.getBomApprovalWithBomId(
        bomId
      );
      if (!bomApprovalData.length) {
        throw new NotFoundHttpException(message.bom.bomDataNotFound);
      }
      let isActionValid = false;
      let prevApprovalId, errorMessage;

      if (currentApproverLevel > 1) {
        const previousApproval = bomApprovalData.find(
          (approval) =>
            approval.currentApproverLevel === currentApproverLevel - 1
        );
        if (
          previousApproval &&
          previousApproval.status === statusEnum.APPROVED
        ) {
          isActionValid = true;
          prevApprovalId = previousApproval?.id;
        } else {
          isActionValid = false;
          errorMessage = `Cannot approve level ${currentApproverLevel}. Level ${currentApproverLevel - 1
            } is not approved yet.`;
          logger.info(message);
        }
      } else {
        isActionValid = true;
      }

      logger.info(
        `Final isActionValid: ${isActionValid}, previous approval id: ${prevApprovalId}`
      );

      if (isActionValid) {
        const bomData = bomApprovalData[0].BomDataModal;
        const userData = bomApprovalData[0].BomDataModal.UserModel;
        if (status === statusEnum.APPROVED) {
          if (currentApproverLevel === totalApproverLevel) {
            await this.bomFormDataDao.update(bomId, {
              status: statusEnum.APPROVED,
            });
            const templatePath = `${process.cwd()}/src/template/bom.approved.ejs`;
            // send email to user bom document is fully approved
            this.emailService.sendMail({
              emailTo: userData.email,
              subject: NotificationSubject.ESCALATION,
              html: await ejs.renderFile(templatePath, {
                userName: userData?.name,
                bomDocumentName: bomData.partName,
                bomDocumentId: bomData.bomId,
              }),
            });
            //send email to approver
            return await this.bomFormDataDao.updateBomApproval(id, {
              status: statusEnum.APPROVED,
              comments: comments ? comments : statusEnum.APPROVED,
            });
          } else {
            // send email to approver
            // send email to next approver
            return await this.bomFormDataDao.updateBomApproval(id, {
              status: statusEnum.APPROVED,
              comments: comments ? comments : statusEnum.APPROVED,
            });
          }
        } else if (status === statusEnum.REJECTED) {
          await this.bomFormDataDao.update(bomId, {
            status: statusEnum.REJECTED,
          });
          // reject email to user and current approver
          return await this.bomFormDataDao.updateBomApproval(id, {
            status: statusEnum.REJECTED,
            comments: comments ? comments : statusEnum.REJECTED,
          });
        } else if (status === statusEnum.SENDBACK) {
          // send email to previuos approver for again checking
          await this.bomFormDataDao.updateBomApproval(prevApprovalId, {
            status: statusEnum.PENDING,
          });

          // sendback email to current approval
          return await this.bomFormDataDao.updateBomApproval(id, {
            status: statusEnum.SENDBACK,
            comments: comments ? comments : statusEnum.SENDBACK,
          });
        }
      } else {
        logger.error(`Action not permitted at this level: ${id}`);
        throw new BadRequestHttpException(errorMessage);
      }
    } catch (error) {
      logger.error({
        message: "Error in approving BOM",
        context: "BomService",
        method: "PUT",
        error: error.message,
      });
      throw error;
    }
  };

  public reviewBom = async (approverId: string, payload) => {
    try {
      logger.info({
        message: "Fetching Bom data for review",
        context: "BomService",
        method: "GET",
        data: { approverId, payload },
      });
      const {
        status,
        page = 1,
        pageSize = 10,
        sortBy = "createdAt",
        sortOrder = "ASC",
      } = payload;
      const where: any = {
        approverId,
      };

      if (!status || status == statusEnum.PENDING) {
        logger.info(`Status if for fetching review bom: ${status}`);
        where.status = {
          [Op.or]: [statusEnum.PENDING, statusEnum.SENDBACK],
        };
      } else {
        logger.info(`Status if for fetching review bom: ${status}`);
        where.status = status;
      }

      const offset = (page - 1) * +pageSize;
      const data = await this.bomFormDataDao.reviewBom(
        where,
        +pageSize,
        offset,
        sortBy,
        sortOrder
      );

      const { count, rows } = data;

      if (!rows.length && !count) {
        logger.error(
          `BOM data not found for this particular approver id: ${approverId}. Data: ${JSON.stringify(
            data
          )}`
        );
        throw new NotFoundHttpException(message.bom.bomDataNotFound);
      }

      logger.info({
        message: "Fetching bom data for reiview with filter is ended",
        context: "BomService",
        method: "GET",
      });
      return { bomData: rows, count, page: +page, pageSize: +pageSize };
    } catch (error) {
      logger.error({
        message: "Error in fetching bom data for review",
        context: "BomService",
        method: "GET",
      });
      throw error;
    }
  };

  //------- bom hierarchy
  /**
   *
   * @param payload
   * @returns
   */
  public createBomHierarchy = async (payload: BomHierarchyInterface[]) => {
    try {
      logger.info({
        message: "Create Bom Hierarchy data",
        context: "BomService",
        method: "POST",
      });
      const isTemplateHierarchyExists = await this.bomFormDataDao.getBomHierarchyTemplate(payload[0].plantId)
      if (isTemplateHierarchyExists.length > 0) {
        throw new BadRequestHttpException(message.template.templateHierarchyExists)
      }
      const data = await this.bomFormDataDao.createBulkBomHierarchy(payload);
      if (!data.length) {
        logger.error(`Bom heirarchy is not successfully completed`);
        throw new BadRequestHttpException(
          message.bom.errorInCreatingBOMHierarchy
        );
      }
      return data;
    } catch (error) {
      logger.error({
        message: "Error in during creating Bom Hierarchy data ",
        context: "BomService",
        method: "POST",
      });
      throw error;
    }
  };

  /**
 *
 * @param payload
 * @returns
 */
  public updateBomHierarchyTemplate = async (plantId: string, payload: BomHierarchyInterface[]) => {
    try {
      logger.info({
        message: "Update Bom Hierarchy data",
        context: "BomService",
        method: "PATCH",
      });
      const isTemplateHierarchyExists = await this.bomFormDataDao.getBomHierarchyTemplate(plantId)
      if (!isTemplateHierarchyExists) {
        throw new BadRequestHttpException(message.template.templateHierarchyNotExists)
      }

      await this.bomFormDataDao.deleteBomHierarchyTemplate(plantId)
      const data = await this.bomFormDataDao.createBulkBomHierarchy(payload);

      if (!data.length) {
        logger.error(`Bom heirarchy is not successfully completed`);
        throw new BadRequestHttpException(
          message.bom.errorInCreatingBOMHierarchy
        );
      }
      return data;
    } catch (error) {
      logger.error({
        message: "Error in during updating Bom Hierarchy data ",
        context: "BomService",
        method: "PATCH",
      });
      throw error;
    }
  };

  /**
   *
   * @param id
   * @returns
   */
  public getBomHierarchyById = async (id: string) => {
    try {
      logger.info({
        message: "Fetching Bom Hierarchy data",
        context: "BomService",
        method: "GET",
      });
      const data = await this.bomFormDataDao.getBomHierarchyById(id);
      if (!data.length) {
        logger.error(`BOM hierarchy not found for this particular id: ${id}`);
        throw new NotFoundHttpException(message.bom.bomHierarchyDataNotFound);
      }
      return data;
    } catch (error) {
      logger.error({
        message: "Error in during fetching Bom Hierarchy data ",
        context: "BomService",
        method: "GET",
      });
      throw error;
    }
  };

  /**
   *
   * @param plantId
   */
  public getBomHierarchyByPlantId = async (plantId: string) => {
    try {
      logger.info({
        message: "Fetching Bom Hierarchy data with plant Id",
        context: "BomService",
        method: "GET",
        data: plantId,
      });
      let data;
      if (plantId) {
        data = await this.bomFormDataDao.getBomHierarchyByPlantId(plantId);
      } else {
        data = await this.bomFormDataDao.plantHierarchy();
        data = data?.rows;
      }
      if (!data && data?.rows) {
        logger.error("plant data not found");
        throw new NotFoundHttpException(message.bom.bomHierarchyDataNotFound);
      }
      const transformedData = data
        .map((plant) => {
          if (
            !plant.BomHierarchyModels ||
            plant.BomHierarchyModels.length === 0
          ) {
            return null;
          }
          const sortedHierarchy = [...plant.BomHierarchyModels].sort(
            (a, b) => a.level - b.level
          );


          return {
            plantId: plant.id,
            plantName: plant.plantName,
            totalLevel: plant.BomHierarchyModels.length,
            hierarchy: sortedHierarchy.map((model) => ({
              level: model.level,
              user: model.UserModel.name,
              userId: model.UserModel.id,
              email: model.UserModel.email,
            })),
          };
        })
        .filter((plant) => plant !== null); // Remove null values from the final array

      return transformedData;
    } catch (error) {
      logger.error({
        message: "Error in during fetching Bom Hierarchy data with plant id ",
        context: "BomService",
        method: "GET",
      });
      throw error;
    }
  };
  /**
   *
   * @param id
   * @param payload
   * @returns
   */
  public updateBomHierarchy = async (
    id: string,
    payload: BomHierarchyInterface
  ) => {
    try {
      logger.info({
        message: "Updating Bom Hierarchy data",
        context: "BomService",
        method: "PUT",
      });
      const checkData = await this.bomFormDataDao.getBomHierarchyById(id);
      if (!checkData.length) {
        logger.error(`BOM hierarchy not found for this particular id: ${id}`);
        throw new NotFoundHttpException(message.bom.bomHierarchyDataNotFound);
      }
      return await this.bomFormDataDao.updateBomHierarchy(id, payload);
    } catch (error) {
      logger.error({
        message: "Error in during updating Bom Hierarchy data ",
        context: "BomService",
        method: "PUT",
      });
      throw error;
    }
  };

  /**
   *
   * @param id
   * @returns
   */
  public deleteBomHierarchy = async (id: string) => {
    try {
      logger.info({
        message: "Deleting Bom Hierarchy data",
        context: "BomService",
        method: "DELETE",
      });

      const bomData = await this.bomFormDataDao.getBomHierarchyById(id);
      if (!bomData || !bomData.length) {
        logger.error(`BOM hierarchy not found for this particular id: ${id}`);
        throw new NotFoundHttpException(message.bom.bomHierarchyDataNotFound);
      }

      const { plantId, level } = bomData[0];
      const hierarchyData = await this.bomFormDataDao.getBomHierarchyByPlantId(
        plantId
      );
      if (!hierarchyData || !hierarchyData.length) {
        throw new NotFoundHttpException(message.bom.bomHierarchyDataNotFound);
      }
      let newLevel = 1;
      const data = [];

      for (const item of hierarchyData) {
        if (item.level !== level) {
          item.level = newLevel++;
          data.push({ id: item.id, level: item.level });
        }
      }
      await Promise.all(
        data.map(async (elem) => {
          await this.bomFormDataDao.updateBomHierarchy(elem.id, {
            level: elem.level,
          });
        })
      );
      await this.bomFormDataDao.deleteBomHierarchy(id);
      logger.info({
        message: `BOM hierarchy with ID ${id} deleted successfully.`,
        context: "BomService",
        method: "DELETE",
      });

      return await this.bomFormDataDao.getBomHierarchyByPlantId(plantId);
    } catch (error) {
      logger.error({
        message: "Error during deleting Bom Hierarchy data",
        context: "BomService",
        method: "DELETE",
        error: error.message,
      });
      throw error;
    }
  };

  public checkApprovalOrRejectedData = async (
    status: string,
    bomIds: string[],
    id: string
  ): Promise<BomQueryFilter> => {
    if (
      status === statusEnum.PENDING ||
      status === statusEnum.APPROVED ||
      status === statusEnum.REJECTED
    ) {
      // Prepare the final result
      const approverData = {
        approverId: id,
        bomId: {
          [Op.in]: bomIds,
        },
      };
      return approverData;
    }
  };

  public getApprovalData = async (
    reqData: BomGetApprovalData
  ): Promise<BomDetailsResponse> => {
    logger.info({
      message: "Starting Get Bom Approval Data",
      context: "BomService",
      method: "getApprovalData",
    });
    try {
      const { page, limit, bomId } = reqData.reqQuery;
      const { id } = reqData.userData;

      const pageNumber = page ? parseInt(page, 10) : 1;
      const pageSize = limit ? parseInt(limit, 10) : 10;

      const getData = await this.bomApprovalDao.getData(
        pageNumber,
        pageSize,
        bomId,
        id
      );
      logger.info({
        message: "Get Bom Approval Data is completed",
        context: "BomService",
        method: "getApprovalData",
        getData,
      });
      return getData;
    } catch (error) {
      logger.error({
        error: error?.message || "Error getting bom approval data",
        context: "BomService",
        method: "getApprovalData",
      });
      if (error instanceof NotFoundHttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        error?.message || message.general.serverError
      );
    }
  };

  public getApprovals = async (
    reqData: BomGetApprovalData
  ): Promise<BomDetailsResponse> => {
    logger.info({
      message: "Starting Get Bom Approval Data",
      context: "BomService",
      method: "getApprovalData",
    });
    try {
      const { status, page, limit } = reqData.reqQuery;
      const { role, id } = reqData.userData;

      const pageNumber = page ? parseInt(page, 10) : 1;
      const pageSize = limit ? parseInt(limit, 10) : 10;

      let whereCondition: any = {};

      if (role === roleEnum.PLANT_ADMIN || role === roleEnum.PLANT_USER) {
        whereCondition = {
          approverId: id,
          ...(status === statusEnum.PENDING
            ? {
              [Op.or]: [
                { status: statusEnum.PENDING },
                { status: statusEnum.SENDBACK },
              ],
            } // Treat SENDBACK as PENDING
            : { status }),
        };

        // It will get all the BOM IDs to be approved by that particular approver
        const getBomIds = await this.bomApprovalDao.getBomIdByApproverId(
          whereCondition
        );

        if (!getBomIds || !getBomIds.length) {
          throw new NotFoundHttpException(
            `BOM are not ${status} by the Logged-In User!`
          );
        }

        // Extract all BOM IDs
        const bomIds = getBomIds.map((bom: { bomId: string }) => bom.bomId); // 0

        if (status) {
          const checkApproveOrDisapprove =
            await this.checkApprovalOrRejectedData(status, bomIds, id);

          if (!checkApproveOrDisapprove) {
            throw new NotFoundHttpException(message.general.dataNotFound);
          }

          if (
            status === statusEnum.APPROVED ||
            status === statusEnum.REJECTED ||
            status === statusEnum.PENDING
          ) {
            whereCondition = checkApproveOrDisapprove;
          }
        }
      }

      const getData = await this.bomApprovalDao.getApprovals(
        whereCondition,
        pageNumber,
        pageSize
      );
      logger.info({
        message: "Get Bom Approval Data is completed",
        context: "BomService",
        method: "getApprovalData",
        getData,
      });
      return getData;
    } catch (error) {
      logger.error({
        error: error?.message || "Error getting bom approval data",
        context: "BomService",
        method: "getApprovalData",
      });
      if (error instanceof NotFoundHttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        error?.message || message.general.serverError
      );
    }
  };

  public approveBomData = async (reqData: approveBomReqData): Promise<any> => {
    logger.info({
      message: "Starting Bom Approval",
      context: "BomService",
      method: "approveBomData",
    });

    try {
      const {
        senderComment,
        bomId,
        senderApproverId,
        receiverApproverId,
        senderLevel,
        receiverLevel,
        totalLevel,
        senderStatus,
        receiverStatus,
      } = reqData.reqBody;
      const { approvalId } = reqData.reqQuery;
      const { userId } = reqData;

      const createData = {
        bomId,
        totalLevel,
        senderLevel,
        senderStatus,
        senderComment,
        receiverLevel,
        receiverStatus,
        senderApproverId,
        receiverApproverId,
      };

      const updateBom = {
        status: senderStatus,
        statusText: `level ${senderLevel}`,
      };

      const getStatus = await this.bomApprovalDao.getApprovalData(approvalId);
      const getApproverId = getStatus?.approverId;

      if (userId !== getApproverId) {
        throw new UnauthorizedHttpException(message.bomApproval.userNotAllowed);
      }

      if (senderLevel === 1 && senderStatus === statusEnum.SENDBACK) {
        throw new UnauthorizedHttpException(
          message.bomApproval.sendBackNotAllowed
        );
      }

      const latestApproval =
        await this.bomApprovalDao.getApprovalByBomIdAndLevel(
          bomId,
          senderLevel
        );

      const handleApproval = async () => {
        const handleData = await this.bomApprovalDao.handleApprovalDocument(
          createData
        );
        await this.bomFormDataDao.updateBomStatus(updateBom, bomId);

        if (senderStatus === statusEnum.SENDBACK) {
          // update the status of current user to Sendback
          await this.bomApprovalDao.updateApproverStatus(
            { status: statusEnum.SENDBACK },
            { approverId: userId, bomId }
          );
          // update the status of previous level user to sendback as well
          await this.bomApprovalDao.updateApproverStatus(
            { status: statusEnum.PENDING },
            { currentApproverLevel: senderLevel - 1, bomId }
          );
        }

        if (senderStatus === statusEnum.APPROVED) {
          // When BOM was sent back, and now previous approver approved again
          // Find the approver who sent it back (who had status SENDBACK before)
          const sentBackApprover = await this.bomApprovalDao.getApproverWhoSentBack(bomId, senderLevel + 1);

          if (sentBackApprover) {
            // Reset their status to PENDING so they can approve again
            await this.bomApprovalDao.updateApproverStatus(
              { status: statusEnum.PENDING },
              { approverId: sentBackApprover.approverId, bomId }
            );
          }
        }

        if (senderStatus === statusEnum.REJECTED) {
          // update the status of current user to Rejected
          await this.bomApprovalDao.updateApproverStatus(
            { status: statusEnum.REJECTED },
            { approverId: userId, bomId }
          );
          // update the higher level user status to Rejected
          await this.bomApprovalDao.updateApproverStatus(
            { status: statusEnum.REJECTED },
            {
              bomId,
              currentApproverLevel: { [Op.gt]: senderLevel },
            }
          );
        }

        await this.bomApprovalDao.updateApproverStatus(updateBom, {
          bomId,
          approverId: userId,
        });
        return handleData;
      };

      if (
        !latestApproval ||
        (Array.isArray(latestApproval) && latestApproval.length === 0) ||
        (latestApproval &&
          senderStatus === statusEnum.APPROVED &&
          latestApproval.senderStatus === statusEnum.APPROVED &&
          latestApproval.receiverStatus === statusEnum.SENDBACK) ||
        approvalId
      ) {
        if (
          latestApproval &&
          senderStatus === statusEnum.APPROVED &&
          latestApproval.senderStatus === statusEnum.APPROVED &&
          getStatus?.status === statusEnum.APPROVED
        ) {
          throw new ConflictHttpException(message.bom.bomApprovalAtLevel1);
        }
        const handleData = await handleApproval();

        logger.info({
          message: latestApproval
            ? "New entry created as the bom was sent back or initial approval."
            : "New entry created as no prior approval data was found.",
          context: "BomService",
          method: "approveBomData",
          handleData,
        });
        return handleData;
      }
      throw new ConflictHttpException(message.approval.invalidApprovalState);
    } catch (error) {
      logger.error({
        error: error?.message || "Error approving Document",
        context: "ApprovalService",
        method: "approveDocument",
      });
      if (
        error instanceof BadRequestHttpException ||
        error instanceof UnauthorizedHttpException ||
        error instanceof ConflictHttpException
      ) {
        throw error;
      }
      throw new HttpException(
        500,
        error?.message || message.general.serverError
      );
    }
  };

  public getBomAndBomFormData = async (reqData): Promise<any> => {
    logger.info({
      message: "Starting Bom and BomFormData Get",
      reqData,
      context: "BomService",
      method: "getBomAndBomFormData",
    });

    try {
      const { bomId, page, limit, status, plantIdSearch } = reqData.reqQuery;
      const { id, role, plantId } = reqData.userData;

      const pageNumber = page ? parseInt(page, 10) : 1;
      const pageSize = limit ? parseInt(limit, 10) : 10;
      const offset = (pageNumber - 1) * pageSize;

      const whereCondition: documentWhereCondition = { id: bomId };
      const plantWhereCondition: documentPlantWhereCondition = {};

      if (status) {
        let where: any = { status };
        if (role === roleEnum.PLANT_USER) {
          where.userId = id;
        } else if (role === roleEnum.PLANT_ADMIN) {
          where.plantId = plantId;
        } else if (role === roleEnum.SUPER_ADMIN) {
          where.plantId = plantIdSearch;
        }

        const matchingIds: string[] = [];
        const getData = await this.bomApprovalDao.checkApprovedVersion(where);
        getData.forEach((item: any) => {
          const approvalHierarchyLevelCount =
            item?.BomApprovalsModels[0]?.totalApproverLevel;
          const approvalHistory = item?.BomApprovalsHistoryModels;
          const rejectedIds = approvalHistory
            .filter(
              (item) => item.dataValues.senderStatus === statusEnum.REJECTED
            )
            .map((item) => item.dataValues.bomId);
          const statusTextLevel = parseInt(
            item?.statusText?.split(" ")?.pop() || "0",
            10
          );
          if (
            where.status === item.status &&
            statusTextLevel === approvalHierarchyLevelCount
          ) {
            matchingIds.push(item.dataValues.id);
          } else if (
            where.status === statusEnum.PENDING &&
            statusTextLevel !== approvalHierarchyLevelCount
          ) {
            matchingIds.push(item.dataValues.id);
          } else if (where.status === statusEnum.REJECTED) {
            matchingIds.push(...rejectedIds);
          }
        });

        if (matchingIds.length > 0) {
          whereCondition.id = { [Op.in]: matchingIds };
        } else {
          throw new NotFoundHttpException(message.general.dataNotFound);
        }
      }


      //Get main BOM data (latest version)
      const mainDataPaginated = await this.bomApprovalDao.get(
        whereCondition,
        plantWhereCondition,
        pageNumber,
        pageSize,
        offset
      );

      const mainData = mainDataPaginated?.data?.[0]; // single result
      if (!mainData) {
        throw new NotFoundHttpException(message.general.dataNotFound);
      }

      // Get all ancestor or previous version BOM ids
      const ancestorIds = await this.bomApprovalDao.getBomAncestorIds({ id: bomId });

      // Fetch data for all ancestors
      let ancestorData = [];

      if (ancestorIds.length > 0) {
        const ancestorWhereCondition: documentWhereCondition = {
          id: ancestorIds,
        };

        const ancestorDataPaginated = await this.bomApprovalDao.get(
          ancestorWhereCondition,
          plantWhereCondition,
          pageNumber,
          ancestorIds.length,
          0
        );

        ancestorData = ancestorDataPaginated?.data || [];
      }

      const response = [mainData, ...ancestorData];

      logger.info({
        message: "BOM and version history fetched",
        context: "BomService",
        method: "getBomAndBomFormData",
        response,
      });

      return response;

    } catch (error) {
      logger.error({
        error: error?.message || "Error during BOM fetch",
        context: "BomService",
        method: "getBomAndBomFormData",
      });

      if (error instanceof NotFoundHttpException) {
        throw error;
      }

      throw new HttpException(500, error?.message || message.general.serverError);
    }
  };

  public getBomData = async (reqData): Promise<any> => {
    logger.info({
      message: "Starting Bom and BomFormData Get",
      context: "BomService",
      method: "getBomAndBormFormData",
    });

    try {
      const { page, limit, status, submissionStatus } = reqData.reqQuery;
      const { id, plantId, role } = reqData.userData;
      const where: any = {};

      const pageNumber = page ? parseInt(page, 10) : 1;
      const pageSize = limit ? parseInt(limit, 10) : 10;
      const offset = (pageNumber - 1) * pageSize;

      const hierarchyLevel = plantId
        ? await this.bomApprovalDao.getHierarchyLevelCount(plantId)
        : 0;

      const isPlantAdminApproved = role === roleEnum.PLANT_ADMIN && status === 'AllApproved';
      const isPlantUserAllApproved =
        [roleEnum.PLANT_USER, roleEnum.PLANT_MODERATOR].includes(role) && status === 'AllApproved';
      const isPlantSuperAdminApproved = role === roleEnum.SUPER_ADMIN && status === 'Approved';

      // Apply userId only if not in special cases
      if (!isPlantAdminApproved && !isPlantUserAllApproved && !isPlantSuperAdminApproved) {
        where.userId = id;
      }

      // Plant Admin or User
      if (isPlantUserAllApproved || isPlantAdminApproved) {
        where.status = 'Approved';
        where.statusText = `level ${hierarchyLevel}`;
        where.plantId = plantId;
      }

      // Handle Approved status
      if (status === 'Approved' || status === 'AllApproved') {
        where.status = 'Approved';

        // Only apply statusText if NOT Super Admin
        if (!isPlantSuperAdminApproved) {
          where.statusText = `level ${hierarchyLevel}`;
        }

        let getData = await this.bomApprovalDao.getAllData(where, pageSize, offset);
        if (!getData) {
          throw new NotFoundHttpException(message.general.dataNotFound);
        }

        let finalRows = getData.rows;
        // Filter to only latest BOMs (not referenced as parentBomId)
        const parentIds = new Set(finalRows.map(bom => bom.parentBomId).filter(pid => pid != null));
        finalRows = finalRows.filter(bom => !parentIds.has(bom.id));

        // Apply filtering logic for Super Admin
        if (isPlantSuperAdminApproved) {
          const plantIds = [...new Set(finalRows.map(bom => bom.plantId))];
          const plantHierarchyMap = await this.bomFormDataDao.getHierarchyLevelMap(plantIds);

          finalRows = finalRows.filter(bom => {
            const expectedLevel = plantHierarchyMap[bom.plantId];
            return bom.statusText === `level ${expectedLevel}`;
          });
        }

        const mergedData = await this.enrichWithApproverData(finalRows);

        return {
          totalItems: finalRows.length,
          totalPages: Math.ceil(finalRows.length / pageSize),
          currentPage: pageNumber,
          pageSize,
          data: mergedData
        };
      }

      // Handle Pending + Draft
      if (status === 'Pending' && submissionStatus === 'Draft') {
        where.submissionStatus = 'Draft';
      } else if (status === 'Pending') {
        where[Op.and] = [
          {
            [Op.or]: [
              {
                status: {
                  [Op.in]: ['Pending', 'SendBack']
                }
              },
              {
                [Op.and]: [
                  { status: 'Approved' },
                  {
                    statusText: {
                      [Op.ne]: `level ${hierarchyLevel}`
                    }
                  }
                ]
              }
            ]
          },
          {
            submissionStatus: 'Completed'
          },
          {
            [Op.or]: [
              {
                statusText: {
                  [Op.ne]: `level ${hierarchyLevel}`
                }
              },
              {
                statusText: {
                  [Op.eq]: `level ${hierarchyLevel}`
                }
              },
              {
                statusText: null
              }
            ]
          }
        ];
      }

      // Handle Rejected
      if (status === 'Rejected') {
        where.status = 'Rejected';
      }

      const getData = await this.bomApprovalDao.getAllData(where, pageSize, offset);
      if (!getData) {
        throw new NotFoundHttpException(message.general.dataNotFound);
      }

      const mergedData = await this.enrichWithApproverData(getData.rows);

      return {
        totalItems: getData.count,
        totalPages: Math.ceil(getData.count / pageSize),
        currentPage: pageNumber,
        pageSize,
        data: mergedData
      };
    } catch (error) {
      logger.error({
        error: error?.message || "Error during bom get",
        context: "BomService",
        method: "getBomData",
      });
      if (error instanceof NotFoundHttpException) {
        throw error;
      }
      throw new HttpException(500, error?.message || message.general.serverError);
    }
  };

  private enrichWithApproverData = async (bomRows: any[]) => {
    return await Promise.all(
      bomRows.map(async (row) => {
        const plainRow = row.get ? row.get({ plain: true }) : row;

        const approverData = await this.bomApprovalDao.getApproversByPlantId(plainRow.plantId);

        const enrichedApproverData = approverData.map((approver) => {
          const approvalInfo = plainRow.BomApprovalsModels?.find(
            (approval) => approval.approverId === approver.userId
          );

          return {
            approverUserId: approver.userId,
            currentApproverLevel: approvalInfo?.currentApproverLevel ?? null,
            totalApproverLevel: approvalInfo?.totalApproverLevel ?? null,
            approverStatus: approvalInfo?.status ?? null,
            approverStatusLevel: approvalInfo?.statusText ?? null,
            approverName: approver?.UserModel?.dataValues?.name,
            approverEmail: approver?.UserModel?.dataValues?.email,
            approverPlantId: approver?.UserModel?.dataValues?.plantId
          };
        });

        const { BomApprovalsModels, ...filteredPlainRow } = plainRow;

        return {
          ...filteredPlainRow,
          approverData: enrichedApproverData
        };
      })
    );
  };

  /**
  *
  * @param id
  * @returns
  */
  public deleteBomHierarchyTemplate = async (plantId: string) => {
    try {
      logger.info({
        message: "Deleting Bom Hierarchy Template data",
        context: "BomService",
        method: "DELETE",
      });
      const checkBomHierarchy = await this.bomFormDataDao.getBomHierarchyTemplate(plantId)
      if (!checkBomHierarchy || !checkBomHierarchy.length) {
        logger.error(`BOM hierarchy template not found for this particular plant id: ${plantId}`);
        throw new NotFoundHttpException(message.bom.bomHierarchyTemplateNotFound);
      }

      const bomData = await this.bomFormDataDao.deleteBomHierarchyTemplate(plantId);

      logger.info({
        message: `BOM hierarchy template with Plant ID ${plantId} deleted successfully.`,
        context: "BomService",
        method: "DELETE",
      });
      return bomData
    } catch (error) {
      logger.error({
        message: "Error during deleting Bom Hierarchy Template data",
        context: "BomService",
        method: "DELETE",
        error: error.message,
      });
      throw error;
    }
  };

  private extractLastDigit = (statusText: string | null) => {
    if (!statusText) return 0;

    const match = statusText.match(/(\d+)(?!.*\d)/); // match the last number
    return match ? parseInt(match[1], 10) : 0;
  }

  public getBomActivity = async (reqData) => {
    try {
      const { page, limit } = reqData.reqQuery;
      const { plantId } = reqData.userData;
      const pageNumber = page ? parseInt(page, 10) : 1;
      const pageSize = limit ? parseInt(limit, 10) : 10;
      const getTotalLevels = await this.bomFormDataDao.getHierarchyCount(plantId)
      const bomData = await this.bomFormDataDao.getBomStatusActivity(pageSize, plantId);
      const dataWithTotalLevels = bomData.rows.map(item => {
        const plainItem = item.toJSON();
        const getCurrentHierarchyLevel = this.extractLastDigit(plainItem.statusText)
        return {
          ...plainItem,
          currentHierarchyLevel: getCurrentHierarchyLevel,
          totalHierarchyLevels: getTotalLevels,
        };
      });

      return {
        totalItems: bomData.count,
        totalPages: Math.ceil(bomData.count / pageSize),
        currentPage: pageNumber,
        pageSize,
        data: dataWithTotalLevels,
      };
    } catch (error) {
      logger.error({
        message: "Error during get BOM activity status data",
        context: "BomService",
        method: "DELETE",
        error: error.message,
      });
      throw error;
    }
  }

  public getBomPdf = async (data) => {
    try {
      const bomData = await this.getBomAndBomFormData(data);
      const html = getBomPdfHtml(bomData);
      const browser = await puppeteer.launch(
        {
          args: ['--no-sandbox'],
        }
      );
      const page = await browser.newPage();

      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      await browser.close();
      return pdfBuffer

    } catch (error) {
      logger.error({
        message: "Error during deleting Bom Hierarchy Template data",
        context: "BomService",
        method: "DELETE",
        error: error.message,
      });
      throw error;
    }
  }
}

export default BomService;
