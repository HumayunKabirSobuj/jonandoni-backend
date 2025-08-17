import { Category } from "@prisma/client";
import prisma from "../../../shared/prisma";
import AppError from "../../Errors/AppError";
import status from "http-status";

const addCategory = async (data: Category) => {
  // console.log('add category', data)

  const isCategoryExist = await prisma.category.findFirst({
    where: {
      name: data.name,
    },
  });

  if (isCategoryExist) {
    throw new AppError(status.CONFLICT, "Category Already Exist..");
  }

  const result = await prisma.category.create({
    data,
  });
  return result;
};

const getAllCategory = async () => {
  // console.log('get all category....')

  return await prisma.category.findMany();
};
export const categoryService = {
  addCategory,
  getAllCategory,
};
