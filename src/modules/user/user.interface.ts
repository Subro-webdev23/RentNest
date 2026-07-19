import { UserStatus } from "../../../generated/prisma/enums";

export type IUserStatusUpdate = {
  status: UserStatus;
};