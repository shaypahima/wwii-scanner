import { DocumentType, EntityType } from '@prisma/client';

// File related types
export interface File {
  id: string;
  name: string;
  mimeType: string;
  data?: Buffer;
  size: string;
}

// Document related types
export interface Document {
  id?: string;
  title: string;
  fileName: string;
  content: string;
  imageUrl?: string;
  documentType: DocumentType;
  createdAt?: Date;
  updatedAt?: Date;
  entities: Entity[];
}

export interface Entity {
  id?: string;
  name: string;
  date?: string | null;
  type: EntityType;
  documents?: Document[];
}

// Analysis related types
export interface ParsedAnalysis {
  documentType: DocumentType;
  title: string;
  content: string;
  entities: Entity[];
}

export interface AnalysisResult {
  analysis: ParsedAnalysis;
  image: string;
  fileName: string;
}

// API Response types
export interface DocumentResponse {
  analysis: ParsedAnalysis;
  image: string;
  savedDocument: Document;
} 

export interface DatabaseDocument {
  id: string;
  title: string;
  fileName: string;
  content: string;
  imageUrl?: string | null;
  documentType: DocumentType;
  createdAt?: Date;
  updatedAt?: Date;
  entities: Entity[];
}

export interface DatabaseEntity {
  id: string;
  name: string;
  type: EntityType;
  date?: string | null;
}

export interface DocumentsQueryParams {
  id?: string;
  keyword?: string;
  documentType?: DocumentType;
  entity?: string;
}

export interface EntitiesQueryParams {
  id?: string;
  type?: EntityType;
  keyword?: string;
  entityType?: EntityType;
  date?: string;
}

