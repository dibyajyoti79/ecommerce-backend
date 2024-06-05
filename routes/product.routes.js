import express from "express";
import { isAdmin, isAuthenticated } from "../middleware/auth.middleware.js";
import {
  getAllProducts,
  getProductDetails,
  createProduct,
  updateProduct,
  updateProductImage,
  deleteProductImage,
  deleteProduct,
  addReview,
  getTopProducts,
} from "../controllers/product.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

// Route - /api/v1/product/get-all
router.route("/get-all").get(getAllProducts);

// Route - /api/v1/product/get-top-products
router.route("/get-top-products").get(getTopProducts);

// Route - /api/v1/product/:id
router.route("/:id").get(getProductDetails);

// Route - /api/v1/product/:id
router
  .route("/create")
  .post(isAuthenticated, isAdmin, upload.single("image"), createProduct);

// Route - /api/v1/product/update/:id
router.route("/update/:id").put(isAuthenticated, isAdmin, updateProduct);

// Route - /api/v1/product/update-image/:id
router
  .route("/update-image/:id")
  .put(isAuthenticated, isAdmin, upload.single("image"), updateProductImage);

// Route - /api/v1/product/delete-image/:id
router
  .route("/delete-image/:id")
  .put(isAuthenticated, isAdmin, deleteProductImage);

// Route - /api/v1/product/:id
router.route("/delete/:id").delete(isAuthenticated, isAdmin, deleteProduct);

// Route - /api/v1/product/:id/review
router.put("/:id/review", isAuthenticated, addReview);

export default router;
