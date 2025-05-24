import express from "express";
import {
  getDirectoryContent,
  getDocumentMetadata,
  analyzeDocument,
  saveAnalyzedDocument,
} from "../controllers/documents";

const router = express.Router();

router.get("/get-dir-content", getDirectoryContent);
router.get("/get-document-metadata/:fileId", getDocumentMetadata);
router.get("/document-content-analysis/:fileId", analyzeDocument);
router.post("/document-content-analysis/:fileId/save", saveAnalyzedDocument);

export default router;