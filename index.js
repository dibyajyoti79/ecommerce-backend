import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDB } from "./db/index.js";
import { configureCloudinary } from "./utils/cloudinary.js";
import Stripe from "stripe";

// config environment variables
dotenv.config();
configureCloudinary();
export const stripe = new Stripe(process.env.STRIPE_API_SECRET);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(
    `⚙️ Server is running at port : ${PORT} in ${process.env.NODE_ENV} mode`
      .blue
  );
  connectDB();
});
