import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createCategory = asyncHandler(async (req, res, next) => {
  const { category } = req.body;
  if (!category) {
    throw new ApiError(400, "please provide category name");
  }
  await Category.create({ category });
  res
    .status(201)
    .json(
      new ApiResponse(201, null, `${category} category creted successfully`)
    );
});

export const getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({});
  res
    .status(200)
    .json(new ApiResponse(200, categories, "Categories Fetch Successfully"));
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError("Category not found");
  }
  // find product with this category id
  const products = await Product.find({ category: category._id });
  // update producty category
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    product.category = undefined;
    await product.save();
  }
  await category.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Catgeory Deleted Successfully"));
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }
  const { categoryName } = req.body;
  if (!categoryName) throw new ApiError(400, "Please Provide Category Name");
  category.category = categoryName;

  await category.save();
  res
    .status(200)
    .json(new ApiResponse(200, null, "Catgeory Updated Successfully"));
});
