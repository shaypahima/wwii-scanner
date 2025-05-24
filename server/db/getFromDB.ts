import { Prisma } from "@prisma/client";
import { prisma } from "../controllers/documents";
import {
  DatabaseDocument,
  DatabaseEntity,
  DocumentsQueryParams,
  EntitiesQueryParams,
} from "../core/types";
import { AppError, NotFoundError } from "../errors/AppError";
import { InternalServerError } from "groq-sdk";

export const getDocuments = async (
  query: DocumentsQueryParams
): Promise<DatabaseDocument[]> => {
  try {
    const where: Prisma.DocumentWhereInput = {};
    const { id, keyword, documentType, entity } = query;
    if (entity) {
      const documents = await prisma.document.findMany({
        where: {
          entities: {
            some: { id: entity },
          },
        },
        include: {
          entities: true,
        },
      });
      if (documents.length > 0) {
        return documents as DatabaseDocument[];
      }
      throw new NotFoundError("No documents found");
    }
    if (id) where.id = id;
    if (documentType) where.documentType = documentType;
    if (keyword) where.content = { contains: keyword };
    const documents = await prisma.document.findMany({
      where,
      include: {
        entities: true,
      },
    });
    if (documents.length > 0) {
      return documents as DatabaseDocument[];
    }
    throw new NotFoundError("No documents found");
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new InternalServerError(
      500,
      error as Error,
      "Internal server error",
      {}
    );
  }
};

export const getEntities = async (
  query: EntitiesQueryParams
): Promise<DatabaseEntity[]> => {
  try {
    const where: Prisma.EntityWhereInput = {};
    const { id, type, keyword, entityType, date } = query;
    if (id) where.id = id;
    if (type) where.type = type;
    if (keyword) where.name = { contains: keyword };
    if (entityType) where.type = entityType;
    if (date) where.date = { equals: date };
    const entities = await prisma.entity.findMany({
      where,
    });
    return entities as DatabaseEntity[];
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new InternalServerError(
      500,
      error as Error,
      "Internal server error",
      {}
    );
  }
};
