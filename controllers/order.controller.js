import { stripe } from "../index.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createOrder = asyncHandler(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentMethod,
    paymentInfo,
    itemPrice,
    tax,
    shippingCharges,
    totalAmount,
  } = req.body;

  await Order.create({
    user: req.user._id,
    shippingInfo,
    orderItems,
    paymentMethod,
    paymentInfo,
    itemPrice,
    tax,
    shippingCharges,
    totalAmount,
  });

  // stock update
  for (let i = 0; i < orderItems.length; i++) {
    // find product
    const product = await Product.findById(orderItems[i].product);
    product.stock -= orderItems[i].quantity;
    await product.save();
  }
  res.status(201).json(new ApiResponse(201, "Order Placed Successfully"));
});

export const myOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  //   if (!orders) {
  //     throw new ApiError(404, "No orders found");
  //   }
  res
    .status(200)
    .json(
      new ApiResponse(
        201,
        { totalOrder: orders.length, orders },
        "Order Fetched Successfully"
      )
    );
});

export const getOrderDetails = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError(404, "no order found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, order, "Order Details Fetched Successfully"));
});

export const handlePayment = asyncHandler(async (req, res, next) => {
  const { totalAmount } = req.body;
  if (!totalAmount) {
    throw new ApiError(400, "Total Amount is require");
  }
  const { client_secret } = await stripe.paymentIntents.create({
    amount: Number(totalAmount * 100),
    currency: "INR",
  });

  res.status(200).json(new ApiResponse(200, { client_secret }));
});

export const getAllOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({});
  res
    .status(200)
    .json(new ApiResponse(200, { totalOrders: orders.length, orders }));
});

export const changeOrderStatus = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  // validatiom
  if (!order) {
    throw new ApiError(404, "order not found");
  }
  if (order.orderStatus === "processing") order.orderStatus = "shipped";
  else if (order.orderStatus === "shipped") {
    order.orderStatus = "deliverd";
    order.deliverdAt = Date.now();
  } else {
    throw new ApiError(500, "order already deliverd");
  }
  await order.save();
  res.status(200).json(new ApiResponse(200, null, "order status updated"));
});
