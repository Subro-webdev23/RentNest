import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { prisma } from '../../lib/prisma';
import { Role, UserStatus } from '../../../generated/prisma/enums';

const getAllUsersFromDB = async () => {
  const result = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result;
};

const updateUserStatusIntoDB = async (
  id: string,
  payload: { status: UserStatus }
) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user.role === Role.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, 'Admin status cannot be changed');
  }

  if (
    payload.status !== UserStatus.ACTIVE &&
    payload.status !== UserStatus.BANNED
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid status value');
  }

  const result = await prisma.user.update({
    where: { id },
    data: { status: payload.status },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });

  return result;
};

export const UserService = {
  getAllUsersFromDB,
  updateUserStatusIntoDB,
};