import { NextFunction, Request, Response } from "express";

import { logger } from "@/utils/logger";
import { message } from "@utils/message";
import ApprovalService from "@/services/approval.service";
import { ResponseFormat } from "@exceptions/responseFormat";
import { BadRequestHttpException, HttpException, NotFoundHttpException, UnauthorizedHttpException } from "@exceptions/HttpException";
import { CustomApproveRequest } from "@utils/controller.type"
class ApprovalController {
    public approvalService = new ApprovalService();
    public responseFormat = new ResponseFormat();

    public getApprovalData = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        logger.info({
            message: "Get Approval Data process started",
            context: "ApprovalController",
            method: "getApprovalData",
        });
        try {
            const reqQuery = req.query
            const userData = req.user
            const getData = await this.approvalService.getApprovalData({ reqQuery, userData })
            logger.info({
                message: "Get Approval Data process completed successfully",
                context: "ApprovalController",
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
                message: "Error during Get Approval Data process",
                context: "ApprovalController",
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

    public approveDocument = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        logger.info({
            message: "Approve Document process started",
            context: "ApprovalController",
            method: "approveDocument",
        });
        try {
            const userId = req.user.id
            const reqQuery = (req as CustomApproveRequest).query;
            const reqBody = req.body
            const getData = await this.approvalService.approveDocument({ userId, reqQuery, reqBody })
            logger.info({
                message: "Approve Document process completed successfully",
                context: "ApprovalController",
                method: "approveDocument",
            });
            return this.responseFormat.response(
                res,
                true,
                201,
                getData,
                `Document ${getData.senderStatus} at level ${getData.senderLevel} where total approval levels are ${getData.totalLevel}!`
            );
        } catch (error) {
            logger.error({
                message: "Error during Approve Document process",
                context: "ApprovalController",
                method: "approveDocument",
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
}

export default ApprovalController