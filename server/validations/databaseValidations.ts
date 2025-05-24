import { PrismaClient, DocumentType } from "@prisma/client";
import { Document } from "../core/types";
import {  DuplicateError, ValidationError } from "../errors/AppError";
const prisma = new PrismaClient();

export const validateDocumentForSave = async (document: Document) : Promise<void> => {
  try {
    if (
      !document.title ||
      !document.fileName ||
      !document.content ||
      !document.documentType
    ) {
      throw new ValidationError("Missing required document fields");
    }

    // Validate documentType is a valid enum value
    if (!Object.values(DocumentType).includes(document.documentType as DocumentType)) {
      throw new ValidationError(`Invalid document type. Must be one of: ${Object.values(DocumentType).join(', ')}`);
    }

    // Check for existing document with same title or filename
    const existingDoc = await prisma.document.findFirst({
      where: {
        OR: [
          { title: { equals: document.title, mode: "insensitive" } },
          { fileName: { equals: document.fileName, mode: "insensitive" } },
        ],
      },
    });
    if (existingDoc) {
      throw new DuplicateError("Document with same title or filename already exists");
    }

  } catch (error) {
    console.log(error);
    if (error instanceof ValidationError || error instanceof DuplicateError) {
      throw error;
    }
    throw new ValidationError("Failed to validate document");
  }
};
