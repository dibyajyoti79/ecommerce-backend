import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { cloudinaryDestroy, cloudinaryUpload } from "../utils/cloudinary.js";

export const getAllProducts = asyncHandler(async (req, res, next) => {
  const { keyword } = req.query;
  const products = await Product.find({
    name: {
      $regex: keyword ? keyword : "",
      $options: "i",
    },
  }).populate("category");
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalProducts: products.length, products },
        "All products fetched successfully"
      )
    );
});

export const getTopProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);
  res
    .status(200)
    .json(
      new ApiResponse(200, products, "Top 3 products fetched successfully")
    );
});

export const getProductDetails = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, "product not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, product, "Product Details fetched successfully")
    );
});

export const createProduct = asyncHandler(async (req, res, next) => {
  const { name, description, price, category, stock } = req.body;
  if (!req.file) {
    throw new ApiError(404, "please provide product images");
  }
  const productImagePath = req.file?.path;

  const productImage = await cloudinaryUpload(productImagePath);

  if (!productImage) {
    throw new ApiError(400, "Error in File Upload");
  }

  const image = {
    public_id: productImage.public_id,
    url: productImage.secure_url,
  };

  await Product.create({
    name,
    description,
    price,
    category,
    stock,
    images: [image],
  });

  res
    .status(201)
    .json(new ApiResponse(200, null, "Product Created Successfully"));
});

export const updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  const { name, description, price, stock, category } = req.body;
  console.log(name);
  if (name) product.name = name;
  if (description) product.description = description;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;

  await product.save();
  res.status(200).json(new ApiResponse(200, null, "product details updated"));
});

export const updateProductImage = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  if (!req.file) {
    throw new ApiError(404, "please provide product images");
  }
  const productImagePath = req.file?.path;

  const productImage = await cloudinaryUpload(productImagePath);

  if (!productImage) {
    throw new ApiError(400, "Error in File Upload");
  }

  const image = {
    public_id: productImage.public_id,
    url: productImage.secure_url,
  };

  product.images.push(image);
  await product.save();
  res.status(200).json(new ApiResponse(200, null, "product image updated"));
});

export const deleteProductImage = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  const id = req.query.id;
  if (!id) {
    throw new ApiError(404, "please provide image id");
  }

  let isExist = -1;
  product.images.forEach((item, index) => {
    if (item._id.toString() === id.toString()) isExist = index;
  });
  if (isExist < 0) {
    throw new ApiError(404, "Image Not Found");
  }
  // DELETE PRODUCT IMAGE
  await cloudinaryDestroy(product.images[isExist].public_id);
  product.images.splice(isExist, 1);
  await product.save();
  res
    .status(200)
    .json(new ApiResponse(200, null, "Product Image Deleted Successfully"));
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  // find and delete image from cloudinary
  for (let index = 0; index < product.images.length; index++) {
    await cloudinaryDestroy(product.images[index].public_id);
  }
  await product.deleteOne();
  res
    .status(200)
    .json(new ApiResponse(200, null, "Product Deleted Successfully"));
});

export const addReview = asyncHandler(async (req, res, next) => {
  const { comment, rating } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    throw new ApiError(400, "Product Alredy Reviewed");
  }
  const review = {
    name: req.user.name,
    rating: Number(rating),
    comment,
    user: req.user._id,
  };
  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;
  await product.save();
  res.status(200).json(new ApiResponse(200, null, "Review Added!"));
});
