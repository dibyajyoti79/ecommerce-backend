import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cloudinaryDestroy, cloudinaryUpload } from "../utils/cloudinary.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import bcrypt from "bcrypt";

//-=============== REGISTER ===============-//
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, address, city, country, phone, answer } =
    req.body;
  // validation
  if (
    !name ||
    !email ||
    !password ||
    !city ||
    !address ||
    !country ||
    !phone ||
    !answer
  ) {
    throw new ApiError(400, "Please Provide All Fileds");
  }
  //check exisiting user
  const exisitingUser = await User.findOne({ email });
  if (exisitingUser) {
    throw new ApiError(409, "Email is already exist");
  }
  const user = await User.create({
    name,
    email,
    password,
    address,
    city,
    country,
    phone,
    answer,
  });

  res
    .status(201)
    .json(new ApiResponse(201, null, "Registeration Success, please login"));
});

//-=============== LOGIN ===============-//
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  //validation
  if (!email || !password) {
    throw new ApiError(400, "Please Provide All Fields");
  }
  //check user is exist or not
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "Invalid credentials");
  }
  //check password is correct or not
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(400, "Invalid credentials");
  }
  const token = generateTokenAndSetCookie(user._id, res);

  // Convert user document to plain JavaScript object and remove password
  const userObj = user.toObject();
  delete userObj.password;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: userObj,
        token: token,
      },
      "Login Successfull"
    )
  );
});

//-=============== GET PROFILE ===============-//
export const getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-password");
  res
    .status(200)
    .json(new ApiResponse(200, user, "User Prfolie Fetched Successfully"));
});

//-=============== LOGOUT ===============-//
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "", { maxAge: 0 });
  res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

//-=============== UPDATE USER PROFILE ===============-//
export const updateProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const { name, email, address, city, country, phone } = req.body;
  // validation + Update
  if (name) user.name = name;
  if (email) user.email = email;
  if (address) user.address = address;
  if (city) user.city = city;
  if (country) user.country = country;
  if (phone) user.phone = phone;
  //save user
  await user.save();
  res.status(200).json(new ApiResponse(200, null, "User Profile Updated"));
});

//-=============== UPDATE PASSWORD ===============-//
export const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const { oldPassword, newPassword } = req.body;
  //valdiation
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Please provide old or new password");
  }
  // old pass check
  const isMatch = await user.comparePassword(oldPassword);
  //validaytion
  if (!isMatch) {
    throw new ApiError(400, "Invalid Old Password");
  }
  user.password = newPassword;
  await user.save();
  res
    .status(200)
    .json(new ApiResponse(200, null, "Password Updated Successfully"));
});

//-=============== UPDATE PROFILE PICTURE ===============-//
export const updateProfilePicture = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  console.log("user.profilePic.public_id", user.profilePic.public_id);
  // delete prev image if exist
  if (user.profilePic.public_id) {
    await cloudinaryDestroy(user.profilePic.public_id);
  }
  const avatar = await cloudinaryUpload(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Error in File Upload");
  }

  user.profilePic = {
    public_id: avatar.public_id,
    url: avatar.secure_url,
  };
  // save func
  await user.save();

  res.status(200).json(new ApiResponse(200, null, "profile picture updated"));
});
