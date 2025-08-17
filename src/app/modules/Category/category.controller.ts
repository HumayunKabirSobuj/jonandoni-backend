import { RequestHandler } from "express";
import catchAsync from "../../../shared/catchAsync";
import { categoryService } from "./category.service";
import sendResponse from "../../../shared/sendResponse";
import status from "http-status";

const addCategory: RequestHandler = catchAsync(async (req, res) => {
  const result = await categoryService.addCategory(req.body);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Category added successfully..",
    data: result,
  });
});


const getAllCategory: RequestHandler = catchAsync(async (req, res) => {
  const result = await categoryService.getAllCategory();

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Category fetched successfully..",
    data: result,
  });
});


export const categoryController ={
    addCategory,
    getAllCategory
}