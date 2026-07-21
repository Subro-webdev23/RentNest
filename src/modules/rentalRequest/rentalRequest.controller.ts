import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { RentalRequestService } from './rentalRequest.service';

const getRequestsForLandlord = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user.userId;

  const result = await RentalRequestService.getRequestsForLandlord(landlordId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rental requests retrieved successfully',
    data: result,
  });
});

const updateRequestStatus = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user.userId;
  const { id } = req.params;
  const { status } = req.body;

  const result = await RentalRequestService.updateRequestStatus(landlordId, id as string, status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Rental request ${status.toLowerCase()} successfully`,
    data: result,
  });
});

const createRentalRequest = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user.userId;

  const result = await RentalRequestService.createRentalRequest(tenantId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Rental request submitted successfully',
    data: result,
  });
});

const getRequestsForTenant = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user.userId;

  const result = await RentalRequestService.getRequestsForTenant(tenantId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rental requests retrieved successfully',
    data: result,
  });
});

const getRequestDetails = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user.userId;
  const { id } = req.params;

  const result = await RentalRequestService.getRequestDetails(tenantId, id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rental request details retrieved successfully',
    data: result,
  });
});

export const RentalRequestController = {
  getRequestsForLandlord,
  updateRequestStatus,
  createRentalRequest,
  getRequestsForTenant,
  getRequestDetails,
};