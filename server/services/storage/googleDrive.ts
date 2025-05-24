import { google } from "googleapis";
import { File } from "../../core/types";
import path from "path";
import fs from "fs";
import { GoogleDriveError } from "../../errors/AppError";

class GoogleDriveService {
  private drive;
  private defaultFolderId: string;

  constructor() {
    const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH || 
      path.join(__dirname, '../../config/credentials/service-account-key.json');

    if (!fs.existsSync(credentialsPath)) {
      throw new GoogleDriveError(
        `Google credentials file not found at ${credentialsPath}. ` +
        'Please ensure GOOGLE_CREDENTIALS_PATH is set correctly or the credentials file exists.'
      );
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    this.drive = google.drive({ version: "v3", auth });
    this.defaultFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || 
      "1UYj9HKZOrkJkN5B1ssqX3_3CZELo02Bp";
  }

  async getDirContent(folderId?: string) {
    try {
      const q = `'${folderId ?? this.defaultFolderId}' in parents`;
      const res = await this.drive.files.list({
        q,
        fields: "nextPageToken, files(id, name, mimeType,size)",
        pageSize: 10,
        orderBy: "name",
      });

      const files = res.data.files ?? [];
      if (files.length === 0) {
        return [];
      }

      return files.map((file) => {
        const mimeType = file.mimeType?.split(".") || [];
        return { ...file, type: mimeType[mimeType?.length - 1] };
      });
    } catch (error) {
      throw new GoogleDriveError('Failed to get directory content');
    }
  }

  async getFileMetadata(fileId: string): Promise<File> {
    try {
      const res = await this.drive.files.get({
        fileId: fileId,
        fields: "id, name, mimeType, size",
      });

      return res.data as File;
    } catch (error) {
      throw new GoogleDriveError('Failed to fetch file metadata');
    }
  }

  async getFileContent(fileId: string): Promise<File> {
    try {
      const res = await this.drive.files.get(
        {
          fileId: fileId,
          alt: "media",
        },
        { responseType: "arraybuffer" }
      );
      if (!res.data) {
        throw new GoogleDriveError('Failed to fetch file content');
      }
      const uint8Array = new Uint8Array(res.data as ArrayBuffer);
      const buffer = Buffer.from(uint8Array);
      return {
        id: fileId,
        name: '',
        mimeType: res.headers["content-type"],
        data: buffer,
        size: res.headers["content-length"],
      };
    } catch (error) {
      if (error instanceof GoogleDriveError) {
        throw error;
      }
      throw new GoogleDriveError('Failed to fetch file content');
    }
  }
}

// Export a singleton instance
export const googleDriveService = new GoogleDriveService();

// Export the methods for backward compatibility
export const getDirContent = (folderId?: string) => googleDriveService.getDirContent(folderId);
export const getFileMetadata = (fileId: string) => googleDriveService.getFileMetadata(fileId);
export const getFileContent = (fileId: string) => googleDriveService.getFileContent(fileId); 