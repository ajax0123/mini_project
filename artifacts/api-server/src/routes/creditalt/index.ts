import { Router } from "express";
import { scanDocumentRoute } from "./scan-document.js";
import { scoreRoute } from "./score.js";

const router = Router();

router.post("/scan-document", scanDocumentRoute);
router.post("/score", scoreRoute);

export { router as creditaltRouter };
