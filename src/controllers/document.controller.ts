import { NextFunction, Request, Response } from "express";

import { logger } from "@/utils/logger";
import { message } from "@utils/message";
import FileUploadService from '@/s3Bucket/s3Bucket';
import DocumentService from "@/services/document.service";
import { ResponseFormat } from "@exceptions/responseFormat";
import { HttpException, NotFoundHttpException, UnauthorizedHttpException } from "@exceptions/HttpException";

class DocumentController {
    public documentService = new DocumentService();
    public responseFormat = new ResponseFormat();
    public fileUploadService = new FileUploadService();

    /**
     * 
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
    public uploadDocument = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        logger.info({
            message: "Document Upload process started",
            context: "DocumentController",
            method: "uploadDocument",
        });
        try {
            const reqBody = req.body
            const userData = req.user
            const allFiles: any[] = Array.isArray(req.files)
                ? req.files
                : [
                    ...(req.files['fileUrl'] || []),
                    ...(req.files['productPicture'] || [])
                ];

            if (!allFiles.length) {
                return new NotFoundHttpException(
                    message.document.productOrDocFileNotUploaded
                );
            }

            const fileUrls = allFiles.reduce((acc: Record<string, string[]>, file: any) => {
                if (!file?.fieldname || !file?.location) {
                    console.warn("File missing required properties:", file);
                    return acc;
                }
                if (!acc[file.fieldname]) {
                    acc[file.fieldname] = [];
                }
                acc[file.fieldname].push(file.location);
                return acc;
            }, {});

            const upload = await this.documentService.uploadDocument({ fileUrls, userData, reqBody })
            logger.info({
                message: "Upload Document process completed successfully",
                context: "DocumentController",
                method: "uploadDocument",
            });
            return this.responseFormat.response(
                res,
                true,
                201,
                upload,
                message.users.documentUpload
            );
        } catch (error) {
            logger.error({
                message: "Error during upload document process",
                context: "DocumentController",
                method: "uploadDocument",
                error: error instanceof Error ? error.message : error,
            });
            if (error instanceof NotFoundHttpException || error instanceof HttpException || error instanceof UnauthorizedHttpException) {
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
    public getDocument = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        logger.info({
            message: "Document get process started",
            context: "DocumentController",
            method: "getDocument",
        });
        try {
            const reqQuery = req.query
            const userData = req.user
            const get = await this.documentService.getDocument({ reqQuery, userData })
            logger.info({
                message: "Get Document process completed successfully",
                context: "DocumentController",
                method: "getDocument",
            });
            return this.responseFormat.response(
                res,
                true,
                200,
                get,
                message.document.getDocument
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
}

export default DocumentController