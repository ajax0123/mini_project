import { Router, type IRouter } from "express";
import healthRouter from "./health";
import { creditaltRouter } from "./creditalt/index.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/creditalt", creditaltRouter);

export default router;
