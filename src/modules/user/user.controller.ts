import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { UserService } from './user.service';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsersFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully',
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    const result = await UserService.updateUserStatusIntoDB(id, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User status updated successfully',
      data: result,
    });
  }
);

export const UserController = {
  getAllUsers,
  updateUserStatus,
};