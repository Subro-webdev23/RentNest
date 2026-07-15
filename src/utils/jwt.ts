import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

export type TJwtPayload = {
  userId: string;
  email: string;
  role: 'TENANT' | 'LANDLORD' | 'ADMIN';
};

export const createToken = (
  payload: TJwtPayload,
  secret: string,
  expiresIn: string,
): string => {
  return jwt.sign(payload, secret, {
    expiresIn,
  } as SignOptions);
};

export const verifyToken = (token: string, secret: string): JwtPayload & TJwtPayload => {
  return jwt.verify(token, secret) as JwtPayload & TJwtPayload;
};