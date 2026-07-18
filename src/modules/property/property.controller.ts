import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PropertyService } from './property.service';

const createProperty = catchAsync(async (req, res) => {
  const result = await PropertyService.createProperty(req.body, req.user.userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Property created successfully.',
    data: result,
  });
});

const getAllProperties = catchAsync(async (req, res) => {
  const result = await PropertyService.getAllProperties(req.query as Record<string, string>);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Properties retrieved successfully.',
    meta: result.meta,
    data: result.properties,
  });
});

const getSingleProperty = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PropertyService.getSingleProperty(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property retrieved successfully.',
    data: result,
  });
});

const updateProperty = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PropertyService.updateProperty(id as string, req.body, req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property updated successfully.',
    data: result,
  });
});

const deleteProperty = catchAsync(async (req, res) => {
  const { id } = req.params;
  await PropertyService.deleteProperty(id as string, req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property deleted successfully.',
    data: null,
  });
});

export const PropertyController = {
  createProperty,
  getAllProperties,
  getSingleProperty,
  updateProperty,
  deleteProperty,
};