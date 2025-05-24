import { DocumentType, Prisma } from "@prisma/client";
import { AppError, NotFoundError } from "../errors/AppError";
import { prisma } from "./documents";
import { Request, Response } from "express";
import {
  DatabaseDocument,
  DatabaseEntity,
  DocumentsQueryParams,
  EntitiesQueryParams,
} from "../core/types";
import { getDocuments, getEntities } from "../db/getFromDB";

export async function getDocumentByQuery(req: Request, res: Response){
  try {
    const documents: DatabaseDocument[] = await getDocuments(
      req.query as DocumentsQueryParams
    );
    if (documents.length > 0) {
      console.log(documents);
      res.status(200).json(documents);
    } else {
      throw new NotFoundError("No documents found");
    }
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export async function getEntityByQuery(req: Request, res: Response) {
  try {
    const entities: DatabaseEntity[] = await getEntities(
      req.query as EntitiesQueryParams
    );
    if (entities.length > 0) {
      res.status(200).json(entities);
    } else {
      throw new NotFoundError("No entities found");
    }
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
