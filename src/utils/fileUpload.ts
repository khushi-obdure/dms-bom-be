import { NextFunction, Request, Response } from 'express';

import path from 'path';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { logger } from '@utils/logger';
import { S3Client } from '@aws-sdk/client-s3';
import { BadRequestHttpException } from '@/exceptions/HttpException';

export class FileUploadService {
  public AWS_BUCKET = process.env.AWS_BUCKET;
  public s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      secretAccessKey: process.env.AWS_SECRET,
      accessKeyId: process.env.AWS_KEY,
    },
  });

  async fileupload(req: Request, res: Response, next: NextFunction) {
    try {
      this.upload(req, res, function (error) {
        if (error) {
          logger.error('fileupload: ', error);
        }
      });
    } catch (error) {
      logger.info(error);
      next(error);
    }
  }

  public upload = multer({
    storage: multerS3({
      s3: this.s3,
      bucket: this.AWS_BUCKET,
      acl: 'public-read',
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req: Request, file, cb) {
        const fileConfig = req.body.type;

        if (fileConfig) {
          if (!file.originalname.match(new RegExp('\\.(' + fileConfig.FORMATS.join('|') + ')', 'i'))) {
            return cb(new Error(`Please upload valid ${fileConfig.NAME}.`));
          }
          cb(null, `${fileConfig.AWS_FOLDER}${file.originalname.split('.')[0]}-${Date.now().toString()}${path.extname(file.originalname)}`);
        } else {
          return cb(new Error('Valid field for file upload not found.'));
        }
      },
    }),
  }).fields([{ name: 'documents', maxCount: 5 }]);

  public uploadLocal = multer({
    storage: multer.memoryStorage(),
    fileFilter: function (req, file, callback) {
      const ext = path.extname(file.originalname);
      const supportedFile = ['.xlsx', '.xls', '.ods'];
      if (!supportedFile.includes(ext)) {
        return callback(new BadRequestHttpException(`Only support ${supportedFile.join(', ')} file`));
      }
      callback(null, true);
    },
  }).single('document');
}

export default FileUploadService;
