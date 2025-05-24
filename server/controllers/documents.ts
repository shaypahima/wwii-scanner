import {
  getDirContent,
  getFileMetadata,
  getFileContent,
} from "../services/storage/googleDrive";
import { Request, Response } from "express";
import { PrismaClient, EntityType } from "@prisma/client";
import { File, AnalysisResult, Document, DatabaseDocument } from "../core/types";
import { processDocument } from "../core/document/processor";
import { AppError, ValidationError, NotFoundError } from "../errors/AppError";
import { validateDocumentForSave } from "../validations/databaseValidations";
import { processDocumentWithEntities } from "../services/db/processDocumentWithEntities";

export const prisma = new PrismaClient();

export async function getDirectoryContent(req: Request, res: Response) {
  const folderId = req.query.folderId as string;
  console.log("Folder ID:", folderId);
  try {
    const folderContents = await getDirContent(folderId);
    if (!folderContents) {
      throw new NotFoundError("No documents found in the specified folder");
    }

    console.log("Folder contents:", folderContents);
    res.json(folderContents);
  } catch (error: unknown) {
    console.error("Error fetching documents:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else if (error && typeof error === "object" && "response" in error) {
      res
        .status((error as any).response.status)
        .json({ error: (error as any).response.data.error });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export async function getDocumentMetadata(req: Request, res: Response) {
  const fileId = req.params.fileId as string;
  if (!fileId) {
    throw new ValidationError("File ID is required");
  }

  try {
    const metadata: File = await getFileMetadata(fileId);

    console.log("File metadata:", metadata);
    res.json(metadata);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else if (error && typeof error === "object" && "response" in error) {
      res
        .status((error as any).response.status)
        .json({ error: (error as any).response.data.error });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export const analyzeDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const fileId = req.params.fileId;

    if (!fileId) {
      throw new ValidationError("File ID is required");
    }

    const file: File = await getFileContent(fileId);

    const { name: fileName } = await getFileMetadata(fileId);
    if (!file || !fileName) {
      throw new NotFoundError("File not found");
    }
    file.name = fileName;

    const analysisResult: AnalysisResult = await processDocument(file);
    if (!analysisResult) {
      throw new AppError("Failed to analyze document");
    }

    res.status(200).json(analysisResult);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else if (error && typeof error === "object" && "response" in error) {
      res
        .status((error as any).response.status)
        .json({ error: (error as any).response.data.error });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};
export const saveAnalyzedDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const document: Document = req.body;

    if (!document) {
      throw new ValidationError("No document data available");
    }

    await validateDocumentForSave(document);

    const savedDocument : DatabaseDocument = await processDocumentWithEntities(document);

    if (!savedDocument) {
      throw new AppError("Failed to save document");
    }

    res.status(200).json(savedDocument);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else if (error && typeof error === "object" && "response" in error) {
      res
        .status((error as any).response.status)
        .json({ error: (error as any).response.data.error });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};
