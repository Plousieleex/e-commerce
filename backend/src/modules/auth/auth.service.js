import prisma from '../../config/db.js';
import bcrypt from 'bcrypt';
import jwt from '../../utils/jwt.js';
import resetTokens from '../../utils/resetTokens.js';
import AppError from '../../utils/AppError.js';
import sendEmail from '../../utils/email.js';
import crypto from 'crypto';
import { nanoid } from 'nanoid';

export const signup = async ({
  nameSurname,
  email,
  phoneNumber,
  password,
  passwordConfirm,
}) => {
  const existingUser = await prisma.Users.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    if (!existingUser.isActivated) {
      throw new AppError('Activate Your Account.', 401);
    }
    throw new AppError('Invalid Credentials.', 400);
  }

  if (!(password === passwordConfirm)) {
    throw new AppError('Passwords dont match.', 400);
  }

  password = await bcrypt.hash(password, 12);
  passwordConfirm = null;

  const { finalRandomCode, hashedFinalRandomCode } =
    await resetTokens.createSixDigitToken();

  const activationToken = `Activation Code ${finalRandomCode}`;

  try {
    const newUser = await prisma.Users.create({
      data: {
        nameSurname,
        email,
        phoneNumber,
        password,
        activationToken: hashedFinalRandomCode,
        activationTokenExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // sendEmail function (sends activationToken)
    await sendEmail({
      email: newUser.email,
      subject: 'Activation Token!',
      message: `${activationToken}`,
    });

    // JWT after user activates account, not here!
    return newUser;
  } catch (e) {
    console.log(e);
    await prisma.Users.deleteMany({ where: { email } });

    throw new AppError('Internal Server Error.', 500);
  }
};

export const activateUser = async (email, code) => {
  if (!code) {
    throw new AppError('Provide the code.', 404);
  }

  const userRecord = await prisma.Users.findUnique({
    where: { email },
    select: {
      id: true,
      isActivated: true,
      activationToken: true,
      activationTokenExpires: true,
    },
  });

  if (!userRecord) {
    throw new AppError('No user found.', 404);
  }

  if (userRecord.isActivated) {
    throw new AppError('User is already activated.', 400);
  }

  const hashedToken = crypto.createHash('sha256').update(code).digest('hex');

  if (
    userRecord.activationTokenExpires < new Date() ||
    !(hashedToken === userRecord.activationToken)
  ) {
    throw new AppError('Code is invalid or expired.', 410);
  }

  try {
    const activatedUser = await prisma.Users.update({
      where: { id: userRecord.id },
      data: {
        userActive: true,
        isActivated: true,
        activationToken: null,
        activationTokenExpires: null,
      },
    });

    const token = jwt.signTokenLocal(activatedUser.id, activatedUser.userRole);

    return { user: activatedUser, token };
  } catch (e) {
    console.log(e);
    throw new AppError('Internal Server Error.', 500);
  }
};

export const resendActivationCode = async (email) => {
  const userRecord = await prisma.Users.findUnique({
    where: { email },
    select: {
      id: true,
      activationTokenExpires: true,
      isActivated: true,
      userActive: true,
    },
  });

  if (!userRecord) {
    throw new AppError('No user found.', 404);
  }

  if (userRecord.isActivated || userRecord.userActive) {
    throw new AppError('User is active.', 400);
  }

  const { finalRandomCode, hashedFinalRandomCode } =
    await resetTokens.createSixDigitToken();

  const activationToken = `Activation code resent: ${finalRandomCode}`;

  try {
    const updatedUser = await prisma.Users.update({
      where: { id: userRecord.id },
      data: {
        activationToken: hashedFinalRandomCode,
        activationTokenExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendEmail({
      email: updatedUser.email,
      subject: 'Activation Code Resend',
      message: `${activationToken}`,
    });

    return updatedUser;
  } catch (e) {
    throw new AppError('Internal Server Error.', 500);
  }
};

export const loginEmailPassword = async (email, password) => {
  if (!email || !password) {
    throw new AppError('Provide your email or password.', 400);
  }

  const userRecord = prisma.Users.findUnique({
    where: { email },
  });

  if (!userRecord || !(await bcrypt.compare(password, userRecord.password))) {
    throw new AppError('Invalid credentials.', 400);
  }

  if (!userRecord.isActivated) {
    throw new AppError('Activate your account to login.', 400);
  }

  let userToReturn = userRecord;
  if (!userRecord.userActive) {
    try {
      userToReturn = await prisma.Users.update({
        where: { id: userRecord.id },
        data: {
          userActive: true,
          // deletedAt or inactivatedAt: null
          // lastLogoutAt: null
        },
      });
    } catch (e) {
      throw new AppError('Internal Server Error.', 500);
    }
  }

  const token = jwt.signTokenLocal(userToReturn.id, userToReturn.userRole);

  return { user: userToReturn, token };
};

export const loginPhonePassword = async (phoneNumber, password) => {
  if (!phoneNumber || !password) {
    throw new AppError('Provide your phone number or password.');
  }

  const userRecord = await prisma.Users.findUnique({
    where: { phoneNumber },
  });

  if (!userRecord || !(await bcrypt.compare(password, userRecord.password))) {
    throw new AppError('Invalid Credentials.', 400);
  }

  if (!userRecord.isActivated) {
    throw new AppError('Please activate your account.', 400);
  }

  let userToReturn = userRecord;
  if (!userRecord.userActive) {
    try {
      userToReturn = await prisma.Users.update({
        where: { id: userRecord.id },
        data: {
          userActive: true,
          // deletedAt or inactiveAt: null
          // lastLogoutAt: null
        },
      });
    } catch (e) {
      throw new AppError('Internal Server Error.', 500);
    }
  }

  const token = jwt.signTokenLocal(userToReturn.id, userToReturn.userRole);

  return { user: userToReturn, token };
};

export default {
  signup,
  activateUser,
  resendActivationCode,
  loginEmailPassword,
  loginPhonePassword,
};
