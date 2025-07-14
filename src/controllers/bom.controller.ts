import { NextFunction, Request, Response } from "express";
import { ResponseFormat } from "@/exceptions/responseFormat";

import { logger } from "@/utils/logger";
import { message } from "@/utils/message";
import BomService from "@/services/bom.service";
import { HttpException, NotFoundHttpException, BadRequestHttpException, UnauthorizedHttpException } from "@exceptions/HttpException";
import { CustomApproveRequest } from "@utils/controller.type"

class BomController {
  public bomService = new BomService();
  public responseFormat = new ResponseFormat();

  /**
   *
   * @param req
   * @param res
   * @param next
   * @returns
   */
  public insertFormData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info({
        message: "Insert Form Data in BomFormData Table",
        context: "BomController",
        method: "POST",
      });
      const reqFiles = req.files as Express.Multer.File[];

      // Separate main image and child images
      const imageFiles: { [key: string]: string } = {};
      const childImages: { [key: string]: string } = {};
      const childPdfs: { [key: string]: string } = {}

      reqFiles.forEach((file: any) => {
        if (file.fieldname === 'image' || file.fieldname === 'drawing') {
          imageFiles[file.fieldname] = file.location;
        }

        // Match child Image
        const imageMatch = file.fieldname.match(/bomForm\[(\d+)\]\[childImage\]/);
        if (imageMatch && imageMatch[1]) {
          const index = parseInt(imageMatch[1], 10);
          childImages[index] = file.location;
        }

        // Match child PDF
        const pdfMatch = file.fieldname.match(/bomForm\[(\d+)\]\[childPdf\]/);
        if (pdfMatch && pdfMatch[1]) {
          const index = parseInt(pdfMatch[1], 10);
          childPdfs[index] = file.location;
        }
      });

      let bomForm = [];
      if (typeof req.body.bomForm === 'string') {
        bomForm = JSON.parse(req.body.bomForm);
      } else if (Array.isArray(req.body.bomForm)) {
        bomForm = req.body.bomForm;
      }


      // Add child images to the corresponding bomForm items
      if (Array.isArray(bomForm)) {
        bomForm.forEach((item, index) => {
          if (childImages[index]) {
            item.childImage = childImages[index];
          }
          if (childPdfs[index]) {
            item.childPdf = childPdfs[index];
          }
        });
      }

      const data = await this.bomService.performInsertOperation({
        userId: req.user?.id,
        plantId: req.user?.plantId,
        ...req.body,
        bomForm,
        image: imageFiles.image,
        drawing: imageFiles.drawing,
        id: req.query.bomId,
        createNewVersion: req.query.createNewVersion
      });

      return this.responseFormat.response(
        res,
        true,
        200,
        data,
        message.bom.createBOM
      );
    } catch (err) {
      logger.error({
        message: "Error during inserting BomFormData process",
        context: "bomController",
        method: "POST",
        error: err instanceof Error ? err.message : err,
      });
      next(err);
    }
  };

  /**
   *
   * @param req
   * @param res
   * @param next
   * @returns
   */
  public getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info({
        message: "Data fetching in Bom FormData Table",
        context: "BomController",
        method: "GET",
      });

      const data = await this.bomService.getById(req.query.id as string);
      return this.responseFormat.response(
        res,
        true,
        200,
        data,
        message.bom.bomDataFound
      );
    } catch (err) {
      logger.error({
        message: "Error during create bom process",
        context: "bomController",
        method: "GET",
        error: err instanceof Error ? err.message : err,
      });
      next(err);
    }
  };

  /**
   *
   * @param req
   * @param res
   * @param next
   * @returns
   */
  public findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info({
        message: "Data fetching in Bom FormData Table",
        context: "BomController",
        method: "GET",
      });
      const data = await this.bomService.findAll(
        req.user?.id,
        req.query
      );
      return this.responseFormat.response(
        res,
        true,
        200,
        data,
        message.bom.bomDataFound
      );
    } catch (err) {
      logger.error({
        message: "Error during create bom process",
        context: "bomController",
        method: "GET",
        error: err instanceof Error ? err.message : err,
      });
      next(err);
    }
  };

  /**
   *
   * @param req
   * @param res
   * @param next
   * @returns
   */
  public updateFormData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info({
        message: "Update Form Data in Bom FormData Table",
        context: "BomController",
        method: "PATCH",
      });

      const { files } = req as any;
      const bomId = req.query.bomId as string;
      const bodyData = req.body;

      // Map to store image URL by bomForm index
      const childImageMap: Record<number, string> = {};

      // Extract images and map them to the right index
      files?.forEach((file: any) => {
        if (file.fieldname.startsWith('bomForm[')) {
          const match = file.fieldname.match(/bomForm\[(\d+)\]\[childImage\]/);
          if (match && match[1]) {
            const index = parseInt(match[1], 10);
            childImageMap[index] = file.location;
          }
        }
      });

      // Ensure bodyData.bomForm is parsed as an array of objects
      let parsedForm: any[] = [];

      try {
        if (typeof bodyData.bomForm === 'string') {
          parsedForm = JSON.parse(bodyData.bomForm);
        } else if (Array.isArray(bodyData.bomForm)) {
          parsedForm = bodyData.bomForm;
        } else {
          parsedForm = [];
        }
      } catch (err) {
        console.error('Failed to parse bomForm:', err);
      }

      // Combine form data with uploaded image URLs
      const updatedFormData = parsedForm.map((item, index) => ({
        bomId: req.query.bomId,
        ...item,
        childImage: childImageMap[index] || null
      }));

      const data = await this.bomService.update(bomId, {
        ...req.body,
        bomForm: updatedFormData
      });

      return this.responseFormat.response(
        res,
        true,
        200,
        data,
        message.bom.updateBOMData
      );

    } catch (err) {
      logger.error({
        message: "Error during update bom process",
        context: "bomController",
        method: "PUT",
        error: err instanceof Error ? err.message : err,
      });
      next(err);
    }
  };

  /**
   *
   * @param req
   * @param res
   * @param next
   * @returns
   */
  public deleteBom = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info({
        message: "Delete Form Data in Bom FormData Table",
        context: "BomController",
        method: "DELETE",
      });

      const data = await this.bomService.deleteBom(req.query.bomId as string, req.query.child as unknown as boolean);
      return this.responseFormat.response(
        res,
        true,
        200,
        data,
        message.bom.deleteBOMData
      );
    } catch (err) {
      logger.error({
        message: "Error during delete bom process",
        context: "bomController",
        method: "DELETE",
        error: err instanceof Error ? err.message : err,
      });
      next(err);
    }
  };

  /**
   * 
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  public approveBom = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info({
        message: "Approve Bom",
        context: "BomController",
        method: "PUT",
      });
      const data = await this.bomService.approveBom(req.query.id as string, req.body);
      return this.responseFormat.response(
        res,
        true,
        200,
        data,
        message.bom.updateBOMData
      );
    } catch (err) {
      logger.error({
        message: "Error during approving bom process",
        context: "bomController",
        method: "PUT",
        error: err instanceof Error ? err.message : err,
      });
      next(err);
    }
  };

  /**
   * 
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  public reviewBom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info({
        message: "Fetchig bom data for review is started",
        context: "BomController",
        method: "GET",
      });
      //
      const data = await this.bomService.reviewBom(
        req?.user?.id,
        req.query
      );
      return this.responseFormat.response(
        res,
        true,
        200,
        data,
        message.bom.bomDataFound
      );
    } catch (err) {
      logger.error({
        message: "Error during fetching bom data for review",
        context: "bomController",
        method: "GET",
        error: err instanceof Error ? err.message : err,
      });
      next(err);
    }
  };
  ///--------- bom hierarchy
  /**
   *
   * @param req
   * @param res
   * @param next
   * @returns
   */
  public createBomHierarchy = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info({
        message: "create bom hierarchy data",
        context: "BomController",
        method: "POST",
      });
      const data = await this.bomService.createBomHierarchy(req.body.data);

      return this.responseFormat.response(
        res,
        true,
        201,
        data,
        message.bom.createBOMHierarchy
      );
    } catch (err) {
      logger.error({
        message: "Error during creating Bom Hierarchy process",
        context: "bomController",
        method: "POST",
        error: err instanceof Error ? err.message : err,
      });
      next(err);
    }
  };

  /**
   *
   * @param req
   * @param res
   * @param next
   * @returns
   */
  public updateBomHierarchy = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info({
        message: "Update bom hierarchy data",
        context: "BomController",
        method: "PATCH",
      });
      const data = await this.bomService.updateBomHierarchyTemplate(req.query.plantId as string, req.body.data);

      return this.responseFormat.response(
        res,
        true,
        200,
        data,
        message.template.updateBomHierarchy
      );
    } catch (err) {
      logger.error({
        message: "Error during updating Bom Hierarchy process",
        context: "bomController",
        method: "PATCH",
        error: err instanceof Error ? err.message : err,
      });
      next(err);
    }
  };

  /**
   *
   * @param req
   * @param res
   * @param next
   * @returns
   */
  public getBomHierarchyById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info({
        message: "Fetching bom hierarchy data",
        context: "BomController",
        method: "GET",
      });
      const data = await this.bomService.getBomHierarchyById(
        req.query.id as string
      );

      return this.responseFormat.response(
        res,
        true,
        200,
        data,
        message.bom.bomHierarchyDataFound
      );
    } catch (err) {
      logger.error({
        message: "Error during fetching Bom Hierarchy data",
        context: "bomController",
        method: "GET",
        error: err instanceof Error ? err.message : err,
      });
      next(err);
    }
  };

  public getBomHierarchyByPlantId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info({
        message: "Fetching bom hierarchy data",
        context: "BomController",
        method: "GET",
      });
      const data = await this.bomService.getBomHierarchyByPlantId(
        req?.user?.plantId
      );

      return this.responseFormat.response(
        res,
        true,
        200,
        data,
        message.bom.bomHierarchyDataFound
      );
    } catch (err) {
      logger.error({
        message: "Error during fetching Bom Hierarchy data",
        context: "bomController",
        method: "GET",
        error: err instanceof Error ? err.message : err,
      });
      next(err);
    }
  };

  /**
   *
   * @param req
   * @param res
   * @param next
   * @returns
   */
  public updateBomHierarchyById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info({
        message: "Updating bom hierarchy data",
        context: "BomController",
        method: "PUT",
      });
      const data = await this.bomService.updateBomHierarchy(
        req.query.id as string,
        req.body
      );

      return this.responseFormat.response(
        res,
        true,
        200,
        data,
        message.bom.updateBOMHierarchyData
      );
    } catch (err) {
      logger.error({
        message: "Error during updating bom hierarchy data",
        context: "bomController",
        method: "PUT",
        error: err instanceof Error ? err.message : err,
      });
      next(err);
    }
  };

  /**
   *
   * @param req
   * @param res
   * @param next
   * @returns
   */
  public deleteBomHierarchyById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info({
        message: "Deleting bom hierarchy data",
        context: "BomController",
        method: "DELETE",
      });
      const data = await this.bomService.deleteBomHierarchy(
        req.query.id as string
      );

      return this.responseFormat.response(
        res,
        true,
        200,
        data,
        message.bom.deleteBOMHierarchyData
      );
    } catch (err) {
      logger.error({
        message: "Error during Deleting bom hierarchy data",
        context: "bomController",
        method: "DELETE",
        error: err instanceof Error ? err.message : err,
      });
      next(err);
    }
  };

  public getApprovalData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.info({
      message: "Get Bom Approval Data process started",
      context: "BomController",
      method: "getApprovalData",
    });
    try {
      const userData = req.user
      const reqQuery = req.query
      const getData = await this.bomService.getApprovalData({ reqQuery, userData })
      logger.info({
        message: "Get Bom Approval Data process completed successfully",
        context: "BomController",
        method: "getApprovalData",
      });
      return this.responseFormat.response(
        res,
        true,
        200,
        getData,
        message.approval.getApproval
      );
    } catch (error) {
      logger.error({
        message: "Error during Get Bom Approval Data process",
        context: "BomController",
        method: "getApprovalData",
        error: error instanceof Error ? error.message : error,
      });
      if (error instanceof NotFoundHttpException || error instanceof HttpException) {
        return this.responseFormat.errorResponse(
          res,
          error.errorCode,
          error.success || false,
          error.message
        );
      }

      // Default error handling for other exceptions
      return next(error);
    }
  };

  public getApprovals = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.info({
      message: "Get All Bom Approval Data process started",
      context: "BomController",
      method: "getApprovalData",
    });
    try {
      const userData = req.user
      const reqQuery = req.query
      const getData = await this.bomService.getApprovals({ reqQuery, userData })
      logger.info({
        message: "Get All Bom Approval Data process completed successfully",
        context: "BomController",
        method: "getApprovalData",
      });
      return this.responseFormat.response(
        res,
        true,
        200,
        getData,
        message.approval.getApproval
      );
    } catch (error) {
      logger.error({
        message: "Error during Get All Bom Approval Data process",
        context: "BomController",
        method: "getApprovalData",
        error: error instanceof Error ? error.message : error,
      });
      if (error instanceof NotFoundHttpException || error instanceof HttpException) {
        return this.responseFormat.errorResponse(
          res,
          error.errorCode,
          error.success || false,
          error.message
        );
      }

      // Default error handling for other exceptions
      return next(error);
    }
  };

  public approveBomData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.info({
      message: "Approve Bom process started",
      context: "BOMController",
      method: "approveBomData",
    });
    try {
      const userId = req.user.id
      const reqQuery = (req as CustomApproveRequest).query;
      const reqBody = req.body
      const getData = await this.bomService.approveBomData({ userId, reqQuery, reqBody })
      logger.info({
        message: "Approve Bom process completed successfully",
        context: "BomController",
        method: "approveBomData",
      });
      return this.responseFormat.response(
        res,
        true,
        201,
        getData,
        `BOM ${getData.senderStatus} at level ${getData.senderLevel} where total approval levels are ${getData.totalLevel}!`
      );
    } catch (error) {
      logger.error({
        message: "Error during Approve Bom process",
        context: "BomController",
        method: "approveBomData",
        error: error instanceof Error ? error.message : error,
      });
      if (error instanceof HttpException || error instanceof BadRequestHttpException || error instanceof UnauthorizedHttpException) {
        return this.responseFormat.errorResponse(
          res,
          error.errorCode,
          error.success || false,
          error.message
        );
      }

      // Default error handling for other exceptions
      return next(error);
    }
  };

  /**
   * 
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  public getBomAndBomFormData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.info({
      message: "Bom and BomFormData get process started",
      context: "BomController",
      method: "getDocument",
    });
    try {
      const reqQuery = req.query
      const userData = req.user
      const get = await this.bomService.getBomAndBomFormData({ reqQuery, userData })
      logger.info({
        message: "Get Document process completed successfully",
        context: "DocumentController",
        method: "getBomAndBormFormData",
      });
      return this.responseFormat.response(
        res,
        true,
        200,
        get,
        message.bom.getBomData
      );
    } catch (error) {
      logger.error({
        message: "Error during get document process",
        context: "DocumentController",
        method: "getDocument",
        error: error instanceof Error ? error.message : error,
      });
      if (error instanceof NotFoundHttpException || error instanceof HttpException) {
        return this.responseFormat.errorResponse(
          res,
          error.errorCode,
          error.success || false,
          error.message
        );
      }

      // Default error handling for other exceptions
      return next(error);
    }
  };

  public getBomPdf = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.info({
      message: "Bom and BomFormData get process started",
      context: "BomController",
      method: "getDocument",
    });
    try {
      const reqQuery = req.query
      const userData = req.user
      const pdfBuffer = await this.bomService.getBomPdf({ reqQuery, userData })
      logger.info({
        message: "Get Document process completed successfully",
        context: "DocumentController",
        method: "getBomAndBormFormData",
      });
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="BOM_Report.pdf"',
        'Content-Length': pdfBuffer.length
      });

      res.send(Buffer.from(pdfBuffer));
    } catch (error) {
      logger.error({
        message: "Error during get document process",
        context: "DocumentController",
        method: "getDocument",
        error: error instanceof Error ? error.message : error,
      });
      if (error instanceof NotFoundHttpException || error instanceof HttpException) {
        return this.responseFormat.errorResponse(
          res,
          error.errorCode,
          error.success || false,
          error.message
        );
      }

      // Default error handling for other exceptions
      return next(error);
    }
  };




  /**
   * 
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  public getBomData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.info({
      message: "Bom get process started",
      context: "BomController",
      method: "getBomData",
    });
    try {
      const reqQuery = req.query
      const userData = req.user
      const get = await this.bomService.getBomData({ reqQuery, userData })
      logger.info({
        message: "Get bom process completed successfully",
        context: "BomController",
        method: "getBomData",
      });
      return this.responseFormat.response(
        res,
        true,
        200,
        get,
        message.bom.getBomData
      );
    } catch (error) {
      logger.error({
        message: "Error during get bom process",
        context: "BomController",
        method: "getBomData",
        error: error instanceof Error ? error.message : error,
      });
      if (error instanceof NotFoundHttpException || error instanceof HttpException) {
        return this.responseFormat.errorResponse(
          res,
          error.errorCode,
          error.success || false,
          error.message
        );
      }

      // Default error handling for other exceptions
      return next(error);
    }
  };

  /**
  * 
  * @param req 
  * @param res 
  * @param next 
  * @returns 
  */
  public getBomActivity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.info({
      message: "Get BOM status(In-progress or Approved) activity process started",
      context: "BomController",
      method: "getBomActivity",
    });
    try {
      const reqQuery = req.query
      const userData = req.user
      const get = await this.bomService.getBomActivity({ reqQuery, userData })
      logger.info({
        message: "Get bom activity process completed successfully",
        context: "BomController",
        method: "getBomActivity",
      });
      return this.responseFormat.response(
        res,
        true,
        200,
        get,
        message.bom.getBomData
      );
    } catch (error) {
      logger.error({
        message: "Error during get bom activity process",
        context: "BomController",
        method: "getBomActivity",
        error: error instanceof Error ? error.message : error,
      });

      // Default error handling for other exceptions
      return next(error);
    }
  };

  /**
   *
   * @param req
   * @param res
   * @param next
   * @returns
   */
  public deleteBomHierarchyTemplate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info({
        message: "Deleting bom hierarchy template data",
        context: "BomController",
        method: "DELETE",
      });
      const data = await this.bomService.deleteBomHierarchyTemplate(
        req.query.plantId as string
      );

      return this.responseFormat.response(
        res,
        true,
        200,
        data,
        message.template.deleteTemplate
      );
    } catch (err) {
      logger.error({
        message: "Error during Deleting bom hierarchy template data",
        context: "bomController",
        method: "DELETE",
        error: err instanceof Error ? err.message : err,
      });
      next(err);
    }
  };
}

export default BomController;
