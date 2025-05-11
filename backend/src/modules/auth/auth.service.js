import prisma from '../../config/db.js';
import bcrypt from 'bcrypt';
import jwt from '../../utils/jwt.js';
import resetTokens from '../../utils/resetTokens.js';

export const signup = async ({
  nameSurname,
  email,
  phoneNumber,
  password,
  passwordConfirm,
}) => {
  const existingUser = await prisma.Users.findUnique({
    where: { email },
  });

  if (existingUser) {
    // throw new AppError
  }
};

export default {
  signup,
};
