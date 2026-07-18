import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { prisma } from '../../lib/prisma';
import { TJwtPayload } from '../../utils/jwt';
import { PropertyStatus } from '../../../generated/prisma/enums';
import { Prisma } from '../../../generated/prisma/browser';

type TCreatePropertyPayload = {
  title: string;
  description: string;
  location: string;
  price: number;
  categoryId: string;
};

type TUpdatePropertyPayload = Partial<{
  title: string;
  description: string;
  location: string;
  price: number;
  status: PropertyStatus;
  categoryId: string;
}>;

type TPropertyQuery = {
  category?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  status?: string;
  search?: string;
  page?: string;
  limit?: string;
};

const VALID_STATUSES: PropertyStatus[] = ['AVAILABLE', 'BOOKED', 'UNAVAILABLE'];

const createProperty = async (payload: TCreatePropertyPayload, landlordId: string) => {
  const { title, description, location, price, categoryId } = payload;

  if (!title || !description || !location || price === undefined || !categoryId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'title, description, location, price and categoryId are required.',
    );
  }

  if (typeof price !== 'number' || Number.isNaN(price) || price <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'price must be a positive number.');
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } });

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found.');
  }

  const property = await prisma.property.create({
    data: {
      title,
      description,
      location,
      price,
      categoryId,
      landlordId,
    },
  });

  return property;
};

const getAllProperties = async (query: TPropertyQuery) => {
  const { category, location, minPrice, maxPrice, status, search } = query;

  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
  const skip = (page - 1) * limit;

  const where: Prisma.PropertyWhereInput = {};

  if (category) {
    where.categoryId = category;
  }

  if (location) {
    where.location = { contains: location, mode: 'insensitive' };
  }

  if (status) {
    if (!VALID_STATUSES.includes(status as PropertyStatus)) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid status value.');
    }
    where.status = status as PropertyStatus;
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties,
    meta: { page, limit, total },
  };
};

const getSingleProperty = async (id: string) => {
  const property = await prisma.property.findUnique({ where: { id } });

  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, 'Property not found.');
  }

  return property;
};

const updateProperty = async (
  id: string,
  payload: TUpdatePropertyPayload,
  user: TJwtPayload,
) => {
  const property = await prisma.property.findUnique({ where: { id } });

  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, 'Property not found.');
  }

  if (user.role === 'LANDLORD' && property.landlordId !== user.userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only update your own property.');
  }

  const data: Prisma.PropertyUpdateInput = {};

  if (payload.title !== undefined) data.title = payload.title;
  if (payload.description !== undefined) data.description = payload.description;
  if (payload.location !== undefined) data.location = payload.location;

  if (payload.price !== undefined) {
    if (typeof payload.price !== 'number' || Number.isNaN(payload.price) || payload.price <= 0) {
      throw new AppError(httpStatus.BAD_REQUEST, 'price must be a positive number.');
    }
    data.price = payload.price;
  }

  if (payload.status !== undefined) {
    if (!VALID_STATUSES.includes(payload.status)) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid status value.');
    }
    data.status = payload.status;
  }

  if (payload.categoryId !== undefined) {
    const category = await prisma.category.findUnique({ where: { id: payload.categoryId } });
    if (!category) {
      throw new AppError(httpStatus.NOT_FOUND, 'Category not found.');
    }
    data.category = { connect: { id: payload.categoryId } };
  }

  if (Object.keys(data).length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No valid fields provided to update.');
  }

  const updatedProperty = await prisma.property.update({
    where: { id },
    data,
  });

  return updatedProperty;
};

const deleteProperty = async (id: string, user: TJwtPayload) => {
  const property = await prisma.property.findUnique({ where: { id } });

  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, 'Property not found.');
  }

  if (user.role === 'LANDLORD' && property.landlordId !== user.userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only delete your own property.');
  }

  await prisma.property.delete({ where: { id } });

  return null;
};

export const PropertyService = {
  createProperty,
  getAllProperties,
  getSingleProperty,
  updateProperty,
  deleteProperty,
};