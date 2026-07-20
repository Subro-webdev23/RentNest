import httpStatus from 'http-status';
import { RentalStatus } from '../../../generated/prisma/client';
import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';

const getRequestsForLandlord = async (landlordId: string) => {
  const requests = await prisma.rentalRequest.findMany({
    where: {
      property: {
        landlordId,
      },
    },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          location: true,
          price: true,
        },
      },
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return requests;
};

const updateRequestStatus = async (
  landlordId: string,
  requestId: string,
  status: RentalStatus,
) => {
  if (status !== RentalStatus.APPROVED && status !== RentalStatus.REJECTED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Status must be either APPROVED or REJECTED',
    );
  }


  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: requestId },
    include: { property: true },
  });

  if (!rentalRequest) {
    throw new AppError(httpStatus.NOT_FOUND, 'Rental request not found');
  }


  if (rentalRequest.property.landlordId !== landlordId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to update this rental request',
    );
  }

  if (rentalRequest.status !== RentalStatus.PENDING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `This request is already ${rentalRequest.status}, cannot be updated`,
    );
  }


  const result = await prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.rentalRequest.update({
      where: { id: requestId },
      data: { status },
      include: {
        property: { select: { id: true, title: true } },
        tenant: { select: { id: true, name: true, email: true } },
      },
    });

    if (status === RentalStatus.APPROVED) {
      await tx.rentalRequest.updateMany({
        where: {
          propertyId: rentalRequest.propertyId,
          status: RentalStatus.PENDING,
          id: { not: requestId },
        },
        data: { status: RentalStatus.REJECTED },
      });
    }

    return updatedRequest;
  });

  return result;
};

export const RentalRequestService = {
  getRequestsForLandlord,
  updateRequestStatus,
};