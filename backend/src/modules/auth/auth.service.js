import prisma from '../../config/db.js';
import bcrypt from 'bcrypt';
// import jwt from '../../utils/jwt.js';
import resetTokens from '../../utils/resetTokens.js';
import AppError from '../../utils/AppError.js';
import sendEmail from '../../utils/email.js';

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
    return { newUser };
  } catch (e) {
    console.log(e);
    await prisma.Users.deleteMany({ where: { email } });

    throw new AppError('Internal Server Error.', 500);
  }
};

export default {
  signup,
};
