import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CategoryService } from './category.service';

const createCategory = catchAsync(async (req, res) => {
  const result = await CategoryService.createCategory(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Category created successfully.',
    data: result,
  });
});

const getAllCategories = catchAsync(async (req, res) => {
  const result = await CategoryService.getAllCategories();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Categories retrieved successfully.',
    data: result,
  });
});

const getSingleCategory = catchAsync(async (req, res) => {
    const { id } = req.params;
  const result = await CategoryService.getSingleCategory(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category retrieved successfully.',
    data: result,
  });
});

const updateCategory = catchAsync(async (req, res) => {
    const { id } = req.params;
  const result = await CategoryService.updateCategory(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category updated successfully.',
    data: result,
  });
});

const deleteCategory = catchAsync(async (req, res) => {
    const { id } = req.params;
  await CategoryService.deleteCategory(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category deleted successfully.',
    data: null,
  });
});

export const CategoryController = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};