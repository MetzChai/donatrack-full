import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT ?? 4000;
export const JWT_SECRET = process.env.JWT_SECRET ?? 'change_me';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';
export const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';
export const RESET_TOKEN_EXP_MIN = Number(process.env.RESET_PASSWORD_TOKEN_EXP_MIN ?? 60);
