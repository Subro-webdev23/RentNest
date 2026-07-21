import httpStatus from 'http-status';
import { PropertyStatus, RentalStatus } from '../../../generated/prisma/client';
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

const createRentalRequest = async (
  tenantId: string,
  payload: { propertyId: string; moveInDate?: Date },
) => {
  const { propertyId, moveInDate } = payload;

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
  }

  if (property.status !== PropertyStatus.AVAILABLE) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This property is currently not available for rent',
    );
  }

  const existingPendingRequest = await prisma.rentalRequest.findFirst({
    where: {
      propertyId,
      tenantId,
      status: RentalStatus.PENDING,
    },
  });

  if (existingPendingRequest) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You already have a pending request for this property',
    );
  }

  const result = await prisma.rentalRequest.create({
    data: {
      tenantId,
      propertyId,
      moveInDate,
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
    },
  });

  return result;
};

const getRequestsForTenant = async (tenantId: string) => {
  const requests = await prisma.rentalRequest.findMany({
    where: { tenantId },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          location: true,
          price: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return requests;
};

const getRequestDetails = async (tenantId: string, requestId: string) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: requestId },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          price: true,
          status: true,
        },
      },
    },
  });

  if (!rentalRequest) {
    throw new AppError(httpStatus.NOT_FOUND, 'Rental request not found');
  }

  if (rentalRequest.tenantId !== tenantId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to view this rental request',
    );
  }

  return rentalRequest;
};

export const RentalRequestService = {
  getRequestsForLandlord,
  updateRequestStatus,
  createRentalRequest,
  getRequestsForTenant,
  getRequestDetails,
};