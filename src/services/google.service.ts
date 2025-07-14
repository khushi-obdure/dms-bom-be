import * as fs from "fs";
import { google } from "googleapis";

import { logger } from "@utils/logger";
import { DRIVE_FOLDER_ID } from '@config';

class GoogleService {
    private auth;
    private drive;
    private folderId;
    constructor() {
        this.auth = new google.auth.GoogleAuth({
            keyFile: `${process.cwd()}/src/creds/credentials.json`,
            scopes: ["https://www.googleapis.com/auth/drive"],
        });
        this.drive = google.drive({ version: "v3", auth: this.auth });
        this.folderId = DRIVE_FOLDER_ID;
    }

    public async uploadFile(userEmail: string, permissionAction: string, name) {
      try {
        const auth = this.auth;
        const drive = google.drive({ version: "v3", auth });
    
        const filePath = `${process.cwd()}/src/sheet/ECN.xlsx`;
        logger.info(`File path: ${filePath}`);

        const fileMetadata = {
          name: `${name}.xlsx`, // Name on Google Drive
          parents: [DRIVE_FOLDER_ID], // Specify the folder where the file should be uploaded
        };
    
        const media = {
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          body: fs.createReadStream(filePath),
        };
    
        logger.info(`[INFO] Uploading file: ${fileMetadata.name} to Google Drive...`);
        
        const response: any = await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: "id, webViewLink",
        });
    
        logger.info(`[SUCCESS] File uploaded successfully. File ID: ${response.data.id}, Link: ${response.data.webViewLink}`);
    
        logger.info(`[INFO] Managing permissions for user: ${userEmail} with action: ${permissionAction}`);
        this.managePermissions(response.data.id, userEmail, permissionAction);
    
        return { id: response.data.id, link: response.data.webViewLink };
      } catch (error) {
        logger.error(`[ERROR] Error uploading file: ${error.message}`);
        throw error;

      }
    }
    

    public async managePermissions(fileId: string, userEmail: string, action): Promise<void> {
        try {
            if (action === "grant") {
                logger.info(`Granting edit access to ${userEmail} for file ${fileId}`);
                await this.drive.permissions.create({
                    fileId,
                    requestBody: {
                        type: "user",
                        role: "writer",
                        emailAddress: userEmail,
                    },
                });
                logger.info(`Edit access granted to ${userEmail}`);
            } else if (action === "revoke") {
                logger.info(`Revoking edit access from ${userEmail} for file ${fileId}`);
                const { data } = await this.drive.permissions.list({
                    fileId,
                    fields: "permissions(id, emailAddress, role)",
                });

                const permission = data.permissions?.find(p => p.emailAddress === userEmail);
                if (permission?.id) {
                    await this.drive.permissions.delete({ fileId, permissionId: permission.id });
                    logger.info(`Edit access revoked from ${userEmail}`);
                } else {
                    logger.warn(`User ${userEmail} does not have an explicit permission entry.`);
                }
            }
        } catch (error) {
            logger.error("Error managing permissions", error);
            throw error;
        }
    }

    public async shareFolderWithDomain(domain: string): Promise<void> {
        try {
            logger.info(`Sharing folder ${this.folderId} with domain: ${domain}`);
            await this.drive.permissions.create({
                fileId: this.folderId,
                requestBody: {
                    type: "domain",
                    role: "reader",
                    domain,
                },
            });
            logger.info(`Folder shared with users from ${domain}`);
        } catch (error) {
            logger.error("Error in shareFolderWithDomain", error);
            throw error;
        }
    }
}

export default GoogleService;
