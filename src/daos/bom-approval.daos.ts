import { Op, fn, col, Sequelize } from "sequelize";

import DB from "@/database";
import { statusEnum } from "@/utils/enum";
import { message } from "@/utils/message";
import { NotFoundHttpException } from "@exceptions/HttpException";
import { BomApproval } from "@/interfaces/bom-approval.interface";
import { BomQueryFilter } from "@interfaces/bom.get.approval.interface";
import {
  documentWhereCondition,
  documentPlantWhereCondition,
} from "@utils/bom.type";

class BomApprovalDao {
  public role = DB.Role;
  public user = DB.User;
  public plant = DB.Plant;
  public bomData = DB.BomDataModal;
  public bomFormData = DB.BomFormDataModal;
  public bomApprovalsModel = DB.BomApprovalsModel;
  public bomApprovalHistory = DB.BomApprovalHistory;
  public bomHierarchyTemplate = DB.BomHierarchyModel;

  /**
   *
   * @param payloadData
   * @returns
   */
  public create = async (payloadData: BomApproval) => {
    return await this.bomApprovalsModel.create(payloadData);
  };

  /**
   *
   * @param payload
   * @returns
   */
  public bulkCreate = async (payload: BomApproval[]) => {
    return await this.bomApprovalsModel.bulkCreate(payload);
  };
  /**
   *
   * @param id
   * @returns
   */
  public getById = async (id: string | string[]) => {
    if (Array.isArray(id)) {
      return await this.bomApprovalsModel.findAll({
        where: { id: { [Op.in]: id } },
      });
    } else {
      const result = await this.bomApprovalsModel.findOne({
        where: { id },
      });
      return result ? [result] : [];
    }
  };

  /**
   *
   * @param where
   * @param limit
   * @param offset
   * @param sort
   * @param order
   * @returns
   */
  public filterData = async (where, limit, offset, sort, order) => {
    return await this.bomApprovalsModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sort, order]],
    });
  };

  /**
   *
   * @param id
   * @param data
   * @returns
   */
  public update = async (id: string, data: BomApproval) => {
    const [affectedCount, updatedRecords] = await this.bomApprovalsModel.update(
      data,
      {
        where: { id },
        returning: true, // Ensure it returns the updated data
      }
    );
    return await this.getById(id);
  };

  /**
   *
   * @param id
   * @returns
   */
  public delete = async (id: string) => {
    return await this.bomApprovalsModel.destroy({
      where: { id },
      force: true,
    });
  };

  public getBomIdByApproverId = async (whereCondition: {
    approverId: number;
    status?: { [Op.or]?: string[] } | string;
  }) => {
    return await this.bomApprovalsModel.findAll({
      where: whereCondition,
      raw: true,
    });
  };

  public groupBomData = async (
    approvalData: any[]
  ): Promise<{ groupedData: any[]; bomMap: { [key: string]: any } }> => {
    const groupedData: any[] = [];
    const bomMap: { [key: string]: any } = {};

    for (const approval of approvalData) {
      const bom = approval?.BomDataModal;
      const bomFormData = bom?.BomFormDataModals;
      const bomMadeByUser = bom?.UserModel;
      const bomApprovalHistory = bom?.BomApprovalsHistoryModels;
      const {
        UserModel,
        BomFormDataModals,
        BomApprovalsHistoryModels,
        ...filteredData
      } = bom.dataValues;

      const sortedBomApprovalHistory = Array.isArray(bomApprovalHistory)
        ? bomApprovalHistory.sort(
          (a, b) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        )
        : [];

      if (!bomMap[bom.id]) {
        bomMap[bom.id] = {
          bomApprovalTable: {
            id: approval?.id,
            status: approval?.status,
            statusText: approval?.statusText,
          },
          bomMadeByUser: {
            id: bomMadeByUser.id,
            name: bomMadeByUser.name,
            email: bomMadeByUser.email,
            employeeCode: bomMadeByUser.employeeCode,
            department: bomMadeByUser.department,
            designation: bomMadeByUser.designation,
          },
          bomData: {
            ...filteredData,
            mergedStatus:
              bom?.status === statusEnum.PENDING
                ? bom?.status
                : `${bom?.status} at ${bom?.statusText}`,
            bomFormData,
          },
          approverData: [],
          bomApprovalHistory: sortedBomApprovalHistory,
        };
        groupedData.push(bomMap[bom.id]);
      }
    }
    return { groupedData, bomMap };
  };

  public addApproverData = async (bomMap: {
    [key: string]: any;
  }): Promise<any> => {
    for (const key in bomMap) {
      const bomId = bomMap[key]?.bomData?.id;
      if (bomId) {
        const bomApproverData = await this.bomApprovalsModel.findAll({
          where: { bomId: bomId },
          include: [
            {
              model: this.bomHierarchyTemplate,
              include: [
                {
                  model: this.user,
                },
                {
                  model: this.plant,
                },
              ],
            },
          ],
        });

        for (const user of bomApproverData) {
          if (user) {
            const approverPlantDetails = user?.BomHierarchyModel?.PlantModel;
            const approverDetails = user?.BomHierarchyModel?.UserModel;
            const bomApproverDataObject = {
              approverUserId: approverDetails?.id,
              approverEmail: approverDetails?.email,
              approverRole: approverDetails?.RolesModel?.roleName,
              approverDesignation: approverDetails?.designation,
              approverDepartment: approverDetails?.department,
              approverName: approverDetails?.name,
              approverPlant: `${approverPlantDetails?.plantName} (${approverPlantDetails?.acronym})`,
              status: user?.status,
              currentApproverLevel: parseInt(user?.currentApproverLevel),
              totalApproverLevel: user?.totalApproverLevel,
              createdAt: user?.createdAt,
              updatedAt: user?.updatedAt,
            };
            bomMap[key].approverData.push(bomApproverDataObject);
          }
        }
      }
    }
  };

  public sortBomApproverData = async (bomMap: {
    [key: string]: any;
  }): Promise<any> => {
    for (const key in bomMap) {
      if (bomMap[key]?.approverData) {
        bomMap[key].approverData.sort(
          (a: any, b: any) => a.currentApproverLevel - b.currentApproverLevel
        );
      }
    }
  };

  public getData = async (
    pageNumber: number,
    pageSize: number,
    bomId: string,
    id: string
  ) => {
    try {
      // Fetch raw data with limit and offset
      const { rows: approvalData, count: totalItems } =
        await this.bomApprovalsModel.findAndCountAll({
          where: { approverId: id },
          include: [
            {
              model: this.bomHierarchyTemplate,
            },
            {
              model: this.bomData,
              where: { id: bomId }, //to get the bom approval data by bomId
              include: [
                {
                  model: this.user, //Bom Made by User
                },
                {
                  model: this.bomFormData,
                  separate: true,
                  order: [
                    [Sequelize.literal("CAST(`sNo` AS DECIMAL(10,2))"), "ASC"],
                  ],
                },
                {
                  model: this.bomApprovalHistory,
                },
              ],
            },
          ],
          order: [["updatedAt", "DESC"]],
          limit: pageSize, // Fetch all records to allow complete grouping
          offset: 0, // Ignore initial offset, as we'll apply pagination later
        });

      const { groupedData, bomMap } = await this.groupBomData(approvalData);

      await this.addApproverData(bomMap);
      await this.sortBomApproverData(bomMap);

      const totalGroupedItems = groupedData.length;
      const totalPages = Math.ceil(totalGroupedItems / pageSize);
      const paginatedGroupedData = groupedData.slice(
        (pageNumber - 1) * pageSize,
        pageNumber * pageSize
      );

      return {
        totalItems: totalGroupedItems,
        totalPages,
        currentPage: pageNumber,
        pageSize,
        data: paginatedGroupedData,
      };
    } catch (error) {
      console.error(message.approval.errorFetchingApprovalData, error);
      throw new Error(message.approval.errorFetchingApprovalData);
    }
  };

  public getApprovals = async (
    whereCondition: any,
    pageNumber: number,
    pageSize: number
  ) => {
    try {
      const offset = (pageNumber - 1) * pageSize;

      const { rows: approvalData, count: totalItems } = await this.bomApprovalsModel.findAndCountAll({
        where: whereCondition ? whereCondition : null,
        include: [{
          model: this.bomData,
          where: { submissionStatus: { [Op.ne]: 'Draft' } },

        }],
        order: [["updatedAt", "DESC"]],
        limit: pageSize,
        offset,
      });

      const totalPages = Math.ceil(totalItems / pageSize);

      return {
        totalItems,
        totalPages,
        currentPage: pageNumber,
        pageSize,
        data: approvalData,
      };
    } catch (error) {
      console.error(message.approval.errorFetchingApprovalData, error);
      throw new Error(message.approval.errorFetchingApprovalData);
    }
  };

  public getApprovalData = async (id: string) => {
    return await this.bomApprovalsModel.findOne({ where: { id }, raw: true });
  };

  public getApprovalByBomIdAndLevel = async (
    bomId: string,
    senderLevel: number
  ) => {
    return await this.bomApprovalHistory.findOne({
      where: { bomId, senderLevel },
      order: [["createdAt", "DESC"]],
    });
  };

  public handleApprovalDocument = async (createData: object) => {
    return await this.bomApprovalHistory.create(createData);
  };

  public findById = async (id: string | string[]) => {
    return await this.bomApprovalsModel.findAll({
      where: {
        bomId: id,
      },
    });
  };

  public checkBomReceiverStatus = async (receiverApproverId: string) => {
    return await this.bomApprovalHistory.findOne({
      where: { senderApproverId: receiverApproverId },
      order: [["createdAt", "DESC"]],
      raw: true,
    });
  };

  public checkApprovedVersion = async (whereCondition: any) => {
    const { plantId, status, ...restConditions } = whereCondition;
    return await this.bomData.findAll({
      where: {
        ...restConditions,
      },
      include: [
        {
          model: this.bomFormData,
          raw: true,
        },
        {
          model: this.bomApprovalsModel,
          include: [
            {
              model: this.bomHierarchyTemplate,
              where: plantId ? { plantId } : "",
              attributes: ["level"],
            },
          ],
        },
        {
          model: this.bomApprovalHistory,
          raw: true,
        },
      ],
    });
  };

  public fetchApproverData = async (getApproverData) => {
    const grouped = getApproverData.reduce((acc, approver) => {
      const user = approver?.UserModel?.get({ plain: true }); // Convert to plain JSON
      if (user) {
        acc[approver.bomId] = acc[approver.bomId] || [];
        acc[approver.bomId].push({
          approverUserId: user.id,
          approverName: user.name,
          approverEmail: user.email,
          approverEmployeeCode: user.employeeCode,
          approverDepartment: user.department,
          approverDesignation: user.designation,
          currentApproverLevel: approver.currentApproverLevel,
          totalApproverLevel: approver.totalApproverLevel,
          approverStatus: approver.status,
        });
      }
      return acc;
    }, {});

    // Sort approvers for each BOM ID
    Object.keys(grouped).forEach((bomId) => {
      grouped[bomId].sort(
        (a, b) => a.currentApproverLevel - b.currentApproverLevel
      );
    });

    return grouped;
  };

  public mapApproverDataToBom = (bomAndFormData: any[], getBomApproverData) => {
    return bomAndFormData.map((bom: any) => {
      const {
        BomApprovalsHistoryModels,
        id,
        BomApprovalsModels,
        UserModel,
        ...otherData
      } = bom.dataValues;

      const approvalHistory = BomApprovalsHistoryModels || [];
      const sortedApprovalHistory = Array.isArray(approvalHistory)
        ? approvalHistory.sort(
          (a, b) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        )
        : [];

      // Assign approver data specific to the BOM ID
      const approverData = getBomApproverData[id] || [];

      return {
        id,
        ...otherData,
        bomMadeByUser: UserModel,
        approverData,
        bomApprovalHistory: sortedApprovalHistory,
      };
    });
  };

  public async getBomAncestorIds(latestBomId): Promise<any> {
    const ancestors: number[] = [];

    let currentBom = await this.bomData.findOne({
      where: { id: latestBomId.id },
      attributes: ['id', 'parentBomId'],
    });

    while (currentBom && currentBom.parentBomId) {
      const parentBomId = currentBom.parentBomId;
      ancestors.push(parentBomId);

      currentBom = await this.bomData.findOne({
        where: { id: parentBomId },
        attributes: ['id', 'parentBomId'],
      });
    }
    return ancestors;
  }

  public get = async (
    whereCondition: documentWhereCondition,
    plantWhereCondition: documentPlantWhereCondition,
    pageNumber: number,
    pageSize: number,
    offset: number
  ) => {
    try {
      const excludedUserAttributes = [
        "roleId",
        "passwordHash",
        "isLoggedIn",
        "createdAt",
        "updatedAt",
      ];
      const excludedPlantAttributes = ["facility", "createdAt", "updatedAt"];

      const includeUserAndPlant = [
        {
          model: this.user,
          where: {
            ...(Object.keys(plantWhereCondition).length > 0 && {
              plantId: plantWhereCondition.id,
            }),
          },
          attributes: { exclude: excludedUserAttributes },
          include: [
            {
              model: this.plant,
              attributes: { exclude: excludedPlantAttributes },
            },
          ],
        },
      ];

      const includeApprovalAndHierarchy = [
        {
          model: this.bomApprovalsModel,
          include: [
            {
              model: this.user,
            },
          ],
        },
      ];

      const includeApprovalHistory = [
        {
          model: this.bomApprovalHistory,
        },
      ];

      const includeBomFormData = [
        {
          model: this.bomFormData,
          separate: true,

          order: [[Sequelize.literal("CAST(`sNo` AS DECIMAL(10,2))"), "ASC"]],
        },
      ];

      // Fetch main data
      const getData = await this.bomData.findAndCountAll({
        where: whereCondition,
        include: [
          ...includeBomFormData,
          ...includeUserAndPlant,
          ...includeApprovalAndHierarchy,
          ...includeApprovalHistory,
        ],
        order: [["createdAt", "DESC"]],
        limit: pageSize,
        offset: offset,
      });

      const getRows = getData?.rows;

      const getBomApproverData = await this.fetchApproverData(
        getRows?.flatMap((row) => row?.BomApprovalsModels || []) || []
      );

      let mergedData = this.mapApproverDataToBom(getRows, getBomApproverData);

      const totalItems = getRows?.length;

      // Prepare paginated result
      const paginatedResult = {
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        currentPage: pageNumber,
        pageSize: pageSize,
        data: mergedData,
      };

      return paginatedResult;
    } catch (error) {
      console.error(message.document.failedFetchDocumentData, error);
      throw new Error(message.document.failedFetchDocumentData);
    }
  };

  public updateApproverStatus = async (
    updateBom: { [key: string]: any },
    whereCondition: any
  ) => {
    return await this.bomApprovalsModel.update(updateBom, {
      where: whereCondition,
    });
  };

  public getAllData = async (where, pageSize, offset) => {
    return await this.bomData.findAndCountAll({
      where,
      include: [{
        model: this.bomApprovalsModel
      }],
      order: [['updatedAt', 'DESC']],
      limit: pageSize,
      offset,
      distinct: true,
    });
  };

  public getLatestBom = async (whereCondition) => {
    return await this.bomData.findAndCountAll({
      where: {
        ...whereCondition,
        id: {
          [Op.notIn]: Sequelize.literal(`(
    SELECT DISTINCT parent_bom_id
    FROM bom
    WHERE parent_bom_id IS NOT NULL 
      AND status = 'Approved'
      AND status_text = '${whereCondition.statusText}'
  )`)
        },
      },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: this.bomApprovalsModel
        }
      ],
      distinct: true
    });
  }

  public getApproversByPlantId = async (plantId) => {
    return await this.bomHierarchyTemplate.findAll({
      where: { plantId },
      include: [{ model: this.user }],
    })
  }

  public getHierarchyLevelCount = async (plantId) => {
    return await this.bomHierarchyTemplate.count({ where: { plantId } })
  }

  public getApproverWhoSentBack = async (bomId: string, level: number) => {
    return await this.bomApprovalsModel.findOne({
      where: {
        bomId,
        currentApproverLevel: level,
        status: statusEnum.SENDBACK
      }
    });
  };

}
export default BomApprovalDao;
