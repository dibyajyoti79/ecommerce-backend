import express from "express";
import { healthCheck } from "../controllers/health.controller.js";

//router object
const router = express.Router();

//routes
router.get("/", healthCheck);

// export
export default router;
