import { DocumentType, EntityType } from "@prisma/client";
import { validateJson } from "../../validations/analysisValidations";
import { ParsedAnalysis } from "../types";
import { AnalysisParsingError } from "../../errors/AppError";

export function parseAnalysis(text: string): ParsedAnalysis {
  try {
    console.log("parsing analysis...");
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new AnalysisParsingError("No valid JSON object found in text");
    }
    const parsed = JSON.parse(match[0]);
    const {document_type, title, content, entities} = parsed;
    
    const parsedEntities = entities.map((entity: any) => {
      if(entity.type === EntityType.date) {
        const date = new Date(entity.name);
        return {
          name: entity.name,
          date: date.toISOString(),
          type: entity.type
        }
      }
        return {
          name: entity.name,
          type: entity.type
        }
    }); 

    const parsedAnalysis = {
      documentType : document_type as DocumentType,
      title,
      content,
      entities: parsedEntities
    } as ParsedAnalysis;
    return parsedAnalysis;
  } catch (error) {
    if (error instanceof AnalysisParsingError) {
      throw error;
    }
    throw new AnalysisParsingError("Failed to parse analysis");
  }
}

