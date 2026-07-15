import httpStatus from 'http-status';
import config from '../../config';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthService } from './auth.service';

const register = catchAsync(async (req, res) => {
  const result = await AuthService.registerUser(req.body);

  res.cookie('refreshToken', result.refreshToken, {
    secure: config.env === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User registered successfully.',
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

const login = catchAsync(async (req, res) => {
  const result = await AuthService.loginUser(req.body);

  res.cookie('refreshToken', result.refreshToken, {
    secure: config.env === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Logged in successfully.',
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await AuthService.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token refreshed successfully.',
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const result = await AuthService.changePassword(req.user.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password changed successfully.',
    data: result,
  });
});

const logout = catchAsync(async (req, res) => {
  res.clearCookie('refreshToken');

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Logged out successfully.',
    data: null,
  });
});

export const AuthController = {
  register,
  login,
  refreshToken,
  changePassword,
  logout,
};