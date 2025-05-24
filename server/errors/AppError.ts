export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class DuplicateError extends AppError {
  constructor(message: string, public existingDoc?: any) {
    super(message, 409);
    this.name = 'DuplicateError';
  }
}

export class GoogleDriveError extends AppError {
  constructor(message: string, public cause?: Error, public statusCode: number = 500) {
    super(message, statusCode);
    this.name = 'GoogleDriveError';
  }
}

export class DocumentProcessingError extends AppError {
  constructor(message: string, public cause?: Error, public statusCode: number = 500) {
    super(message, statusCode);
    this.name = 'DocumentProcessingError';
  }
}

export class FileConversionError extends AppError {
  constructor(message: string, public cause?: Error, public statusCode: number = 500) {
    super(message, statusCode);
    this.name = 'FileConversionError';
  }
}

export class GroqServiceError extends AppError {
  constructor(message: string, public cause?: Error, public statusCode: number = 500) {
    super(message, statusCode);
    this.name = 'GroqServiceError';
  }
}

export class AnalysisParsingError extends AppError {
  constructor(message: string, public cause?: Error, public statusCode: number = 500) {
    super(message, statusCode);
    this.name = 'AnalysisParsingError';
  }
}

