import jwt from 'jsonwebtoken';
import AppError from './AppError.js';
import { promisify } from 'util';

export function signTokenLocal(id, userRole) {
  return jwt.sign({ id: id, userRole: userRole }, process.env.JWT_SECRET, {
    algorithm: 'HS512',
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

export default {
  signTokenLocal,
};
