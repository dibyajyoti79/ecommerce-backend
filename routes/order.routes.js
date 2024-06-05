import express from "express";
import { isAdmin, isAuthenticated } from "../middleware/auth.middleware.js";
import {
  createOrder,
  getOrderDetails,
  handlePayment,
  myOrders,
  getAllOrders,
  changeOrderStatus,
} from "../controllers/order.controller.js";

const router = express.Router();

// Route - /api/v1/order/create
router.route("/create").post(isAuthenticated, createOrder);

// Route - /api/v1/order/get-all
router.route("/get-all").get(isAuthenticated, myOrders);

// Route - /api/v1/order/details/:id
router.route("/details/:id").get(isAuthenticated, getOrderDetails);

// Route - /api/v1/order/payment
router.route("/payment").get(isAuthenticated, handlePayment);

// ======== ADMIN  ============
// get all order
router
  .route("/admin/get-all-orders")
  .get(isAuthenticated, isAdmin, getAllOrders);

// change order status
router
  .route("/admin/order/:id")
  .put(isAuthenticated, isAdmin, changeOrderStatus);

export default router;
