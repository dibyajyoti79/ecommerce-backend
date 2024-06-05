import express from "express";
import {
  register,
  login,
  getProfile,
  logout,
  updateProfile,
  updatePassword,
  updateProfilePicture,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { rateLimit } from "express-rate-limit";
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
});

const router = express.Router();

//user routes

// Route - /api/v1/user/register
router.route("/register").post(limiter, register);

// Route - /api/v1/user/login
router.route("/login").post(limiter, login);

// Route - /api/v1/user/profile
router.route("/profile").get(isAuthenticated, getProfile);

// Route - /api/v1/user/logout
router.route("/logout").get(isAuthenticated, logout);

// Route - /api/v1/user/update-profile
router.route("/update-profile").post(isAuthenticated, updateProfile);

// Route - /api/v1/user/update-password
router.route("/update-password").post(isAuthenticated, updatePassword);

// Route - /api/v1/user/update-profile-picture
router
  .route("/update-profile-picture")
  .put(isAuthenticated, upload.single("avatar"), updateProfilePicture);

export default router;
