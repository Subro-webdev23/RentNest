import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { prisma } from '../../lib/prisma';

type TCreateCategoryPayload = {
  name: string;
};

type TUpdateCategoryPayload = Partial<{
  name: string;
}>;

const createCategory = async (payload: TCreateCategoryPayload) => {
  const { name } = payload;

  if (!name || !name.trim()) {
    throw new AppError(httpStatus.BAD_REQUEST, 'name is required.');
  }

  const existing = await prisma.category.findUnique({ where: { name } });

  if (existing) {
    throw new AppError(httpStatus.CONFLICT, 'Category with this name already exists.');
  }

  const category = await prisma.category.create({
    data: { name },
  });

  return category;
};

const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  return categories;
};

const getSingleCategory = async (id: string) => {
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found.');
  }

  return category;
};

const updateCategory = async (id: string, payload: TUpdateCategoryPayload) => {
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found.');
  }

  if (payload.name === undefined || !payload.name.trim()) {
    throw new AppError(httpStatus.BAD_REQUEST, 'name is required.');
  }

  const existing = await prisma.category.findUnique({ where: { name: payload.name } });

  if (existing && existing.id !== id) {
    throw new AppError(httpStatus.CONFLICT, 'Category with this name already exists.');
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: { name: payload.name },
  });

  return updatedCategory;
};

const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found.');
  }

  await prisma.category.delete({ where: { id } });

  return null;
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};