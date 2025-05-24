import { DocumentType, EntityType } from '@prisma/client';
import { ParsedAnalysis } from '../core/types';
import { AnalysisParsingError } from '../errors/AppError';

export function validateJson(json: any): asserts json is ParsedAnalysis {
  if (!json || typeof json !== 'object') {
    throw new AnalysisParsingError('Invalid JSON: must be an object');
  }
  if (!json.title || typeof json.title !== 'string') {
    throw new AnalysisParsingError('Invalid JSON: title must be a string');
  }

  if (!json.content || typeof json.content !== 'string') {
    throw new AnalysisParsingError('Invalid JSON: content must be a string');
  }

  if (!json.entities || !Array.isArray(json.entities)) {
    throw new AnalysisParsingError('Invalid JSON: entities must be an array');
  }

  for (const entity of json.entities) {
    if (!entity.name || typeof entity.name !== 'string') {
      throw new AnalysisParsingError('Invalid JSON: entity name must be a string');
    }
    if (!entity.type || typeof entity.type !== 'string') {
      throw new AnalysisParsingError('Invalid JSON: entity type must be a string');
    }
  }

  const docType = (json.documentType)?.toLowerCase();
  if (!docType || !Object.values(DocumentType).includes(docType as DocumentType)) {
    throw new AnalysisParsingError(`Invalid JSON: documentType must be one of ${Object.values(DocumentType).join(', ')}`);
  }
}
