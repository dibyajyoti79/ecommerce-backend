import express from "express";
import { isAdmin, isAuthenticated } from "../middleware/auth.middleware.js";
import {
  createCategory,
  getAllCategories,
  deleteCategory,
  updateCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

// Route - /api/v1/category/create
router.route("/create").post(isAuthenticated, isAdmin, createCategory);

// Route - /api/v1/category/get-all
router.route("/get-all").get(getAllCategories);

// Route - /api/v1/category/update/:id
router.route("/update/:id").put(isAuthenticated, isAdmin, updateCategory);

// Route - /api/v1/category/delete/:id
router.route("/delete/:id").delete(isAuthenticated, isAdmin, deleteCategory);

export default router;
