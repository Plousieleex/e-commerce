import catchAsync from '../../utils/catchAsync.js';
import authService from './auth.service.js';

export const signup = catchAsync(async (req, res, next) => {
  const { nameSurname, email, phoneNumber, password, passwordConfirm } =
    req.body;

  const user = await authService.signup({
    nameSurname,
    email,
    phoneNumber,
    password,
    passwordConfirm,
  });

  res.status(201).json({
    status: 'success',
    data: { user },
  });
});

export const checkSixDigitTokenActivate = catchAsync(async (req, res, next) => {
  const { email, code } = req.body;

  const { user, token } = await authService.activateUser(email, code);

  res.status(200).json({
    status: 'success',
    message: 'User activated.',
    token,
    data: { user },
  });
});

export const sendSixDigitTokenEmail = catchAsync(async (req, res, next) => {
  const email = req.body.email;
});

export const loginEmailPassword = catchAsync(async (req, res, next) => {});

export const loginPhonePassword = catchAsync(async (req, res, next) => {});

export const sendSixDigitTokenSMS = catchAsync(async (req, res, next) => {});

export const checkSixDigitTokenLogin = catchAsync(async (req, res, next) => {});

export default {
  signup,
  loginEmailPassword,
  loginPhonePassword,
  sendSixDigitTokenEmail,
  sendSixDigitTokenSMS,
  checkSixDigitTokenActivate,
};
