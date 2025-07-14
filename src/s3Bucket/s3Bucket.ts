import { NextFunction, Request, Response } from 'express';
import multer, { MulterError } from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import { BadRequestHttpException } from '@/exceptions/HttpException';

interface OrganizedFiles {
    fileUrl: Express.Multer.File[];
    templateImage?: Express.Multer.File[];
    productPicture?: Express.Multer.File[];
    image?: Express.Multer.File[];
    drawing?: Express.Multer.File[];
    bomForm: Array<{ childImage?: Express.Multer.File[], childPdf?: Express.Multer.File[] }>;
}

// check if files are in array format
function isFileArray(files: any): files is Express.Multer.File[] {
    return Array.isArray(files);
}

// check if files are in fieldname dictionary format
function isFieldFiles(files: any): files is { [fieldname: string]: Express.Multer.File[] } {
    return files && typeof files === 'object' && !Array.isArray(files);
}

class FileUploadService {
    private AWS_BUCKET: string = process.env.AWS_BUCKET as string;
    private s3: S3Client = new S3Client({
        region: process.env.AWS_REGION as string,
        credentials: {
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        },
    });

    private supportedFileTypes: string[] = ['.xlsx', '.xls', '.ods', '.jpg', '.png'];

    private multerS3Storage = multerS3({
        s3: this.s3,
        bucket: this.AWS_BUCKET,
        acl: 'public-read',
        key: (req: Request, file, cb) => {
            const fileName = path.basename(file.originalname);
            cb(null, `${Date.now()}-${fileName}`);
        },
    });

    public upload = multer({
        storage: this.multerS3Storage,
        fileFilter: (req, file, cb) => {
            const allowedPatterns = [
                /^fileUrl$/,
                /^templateImage$/,
                /^productPicture$/,
                /^image$/,
                /^bomForm\[\d+\]\[childImage\]$/,
                /^bomForm\[\d+\]\[childPdf\]$/,
                /^childImage$/,
                /^drawing$/
            ];

            if (allowedPatterns.some(pattern => pattern.test(file.fieldname))) {
                cb(null, true);
            } else {
                cb(new BadRequestHttpException(`Unexpected field: ${file.fieldname}`));
            }
        },
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB limit
            files: 20 // Maximum 20 files
        }
    }).any();

    public uploadHandler = (req: Request, res: Response, next: NextFunction): void => {
        this.upload(req, res, (error: unknown) => {
            if (error) {
                this.handleUploadError(error, res);
                return;
            }

            // Store the original files before organization
            const originalFiles = req.files;

            // Organize the files into preferred structure
            const organizedFiles = this.organizeUploadedFiles(originalFiles);

            // Attach both the original and organized files to the request
            req.files = originalFiles; // Maintain original type for Express compatibility
            (req as any).organizedFiles = organizedFiles; // Our structured format

            next();
        });
    };

    private handleUploadError(error: unknown, res: Response): void {
        if (error instanceof MulterError) {
            console.error('Multer Error:', error);
            res.status(400).json({ error: `File upload error: ${error.message}` });
        } else if (error instanceof BadRequestHttpException) {
            res.status(400).json({ error: error.message });
        } else {
            console.error('Upload Error:', error);
            res.status(500).json({ error: 'Internal server error during file upload' });
        }
    }

    private organizeUploadedFiles(files: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] } | undefined): OrganizedFiles {
        const organizedFiles: OrganizedFiles = {
            fileUrl: [],
            bomForm: []
        };

        if (!files) {
            return organizedFiles;
        }

        // Handle array format
        if (isFileArray(files)) {
            files.forEach(file => this.processSingleFile(file, organizedFiles));
            return organizedFiles;
        }

        // Handle fieldname dictionary format
        if (isFieldFiles(files)) {
            Object.entries(files).forEach(([fieldname, fileArray]) => {
                fileArray.forEach(file => {
                    this.processSingleFile({ ...file, fieldname }, organizedFiles);
                });
            });
            return organizedFiles;
        }

        return organizedFiles;
    }

    private processSingleFile(file: Express.Multer.File, organizedFiles: OrganizedFiles): void {
        const bomFormMatchImage = file.fieldname.match(/^bomForm\[(\d+)\]\[childImage\]$/);
        const bomFormMatchPdf = file.fieldname.match(/^bomForm\[(\d+)\]\[childPdf\]$/);

        if (bomFormMatchImage || bomFormMatchPdf) {
            const index = parseInt((bomFormMatchImage || bomFormMatchPdf)![1], 10);

            // Initialize bomForm slot if it doesn't exist
            organizedFiles.bomForm[index] = organizedFiles.bomForm[index] || {};

            if (bomFormMatchImage) {
                organizedFiles.bomForm[index].childImage = organizedFiles.bomForm[index].childImage || [];
                organizedFiles.bomForm[index].childImage!.push(file);
            } else if (bomFormMatchPdf) {
                organizedFiles.bomForm[index].childPdf = organizedFiles.bomForm[index].childPdf || [];
                organizedFiles.bomForm[index].childPdf!.push(file);
            }
        } else {
            switch (file.fieldname) {
                case 'fileUrl':
                    organizedFiles.fileUrl.push(file);
                    break;
                case 'templateImage':
                    organizedFiles.templateImage = [file];
                    break;
                case 'productPicture':
                    organizedFiles.productPicture = [file];
                    break;
                case 'image':
                    organizedFiles.image = [file];
                    break;
                case 'drawing':
                    organizedFiles.drawing = [file]
            }
        }
    }

}

export default FileUploadService;