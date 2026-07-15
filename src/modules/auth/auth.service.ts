import bcrypt from 'bcryptjs';
import httpStatus from 'http-status';
import config from '../../config';
import AppError from '../../errors/AppError';
import { createToken, verifyToken } from '../../utils/jwt';
import { prisma } from '../../lib/prisma';

type TRegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'TENANT' | 'LANDLORD';
};

type TLoginPayload = {
  email: string;
  password: string;
};

const registerUser = async (payload: TRegisterPayload) => {
  if (!payload.name || !payload.email || !payload.password || !payload.role) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Name, email, password and role are required.');
  }

  if (!['TENANT', 'LANDLORD'].includes(payload.role)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Role must be either TENANT or LANDLORD.');
  }

  if (payload.password.length < 6) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password must be at least 6 characters.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(payload.email)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid email address.');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, 'An account with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(payload.password, config.bcrypt_salt_rounds);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      phone: payload.phone,
      role: payload.role,
    },
  });

  const jwtPayload = { userId: user.id, email: user.email, role: user.role };

  const accessToken = createToken(jwtPayload, config.jwt.access_secret, config.jwt.access_expires_in);
  const refreshToken = createToken(jwtPayload, config.jwt.refresh_secret, config.jwt.refresh_expires_in);

  const { password, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, accessToken, refreshToken };
};

const loginUser = async (payload: TLoginPayload) => {
  if (!payload.email || !payload.password) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Email and password are required.');
  }

  const user = await prisma.user.findUnique({ where: { email: payload.email } });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'No account found with this email.');
  }

  // if (user.status === 'BLOCKED' || user.status === 'DELETED') {
  //   throw new AppError(httpStatus.FORBIDDEN, 'This account has been blocked or deleted.');
  // }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordValid) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Incorrect password.');
  }

  const jwtPayload = { userId: user.id, email: user.email, role: user.role };

  const accessToken = createToken(jwtPayload, config.jwt.access_secret, config.jwt.access_expires_in);
  const refreshToken = createToken(jwtPayload, config.jwt.refresh_secret, config.jwt.refresh_expires_in);

  const { password, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, accessToken, refreshToken };
};

const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Refresh token is required.');
  }

  let decoded;
  try {
    decoded = verifyToken(token, config.jwt.refresh_secret);
  } catch (err) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid or expired refresh token.');
  }

  const { userId } = decoded;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user no longer exists.');
  }

  // if (user.status === 'BLOCKED' || user.status === 'DELETED') {
  //   throw new AppError(httpStatus.FORBIDDEN, 'This account has been blocked or deleted.');
  // }

  const jwtPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = createToken(jwtPayload, config.jwt.access_secret, config.jwt.access_expires_in);

  return { accessToken };
};

const changePassword = async (
  userId: string,
  payload: { oldPassword: string; newPassword: string },
) => {
  if (!payload.oldPassword || !payload.newPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Old and new password are required.');
  }

  if (payload.newPassword.length < 6) {
    throw new AppError(httpStatus.BAD_REQUEST, 'New password must be at least 6 characters.');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user no longer exists.');
  }

  const isPasswordValid = await bcrypt.compare(payload.oldPassword, user.password);

  if (!isPasswordValid) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Old password is incorrect.');
  }

  const hashedPassword = await bcrypt.hash(payload.newPassword, config.bcrypt_salt_rounds);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return null;
};

export const AuthService = {
  registerUser,
  loginUser,
  refreshToken,
  changePassword,
};