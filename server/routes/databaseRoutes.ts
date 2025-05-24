import { Router } from "express";
import { getDocumentByQuery, getEntityByQuery } from "../controllers/database";

const router = Router();

router.get("/documents", getDocumentByQuery);
router.get("/entities", getEntityByQuery);

export default router;

