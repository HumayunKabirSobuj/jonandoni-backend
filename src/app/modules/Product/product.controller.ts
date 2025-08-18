import status from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ProductService } from "./product.service";

const AddProduct = catchAsync(async (req, res) => {
  const result = await ProductService.addProduct();

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Product Add successfully.",
    data: result,
  });
});

export const ProductController = {
  AddProduct,
};
