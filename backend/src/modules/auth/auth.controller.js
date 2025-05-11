import catchAsync from '../../utils/catchAsync.js';
import authService from './auth.service.js';

export const signup = catchAsync(async (req, res, next) => {});

export const loginEmailPassword = catchAsync(async (req, res, next) => {});

export const loginPhonePassword = catchAsync(async (req, res, next) => {});

export const sendSixDigitTokenEmail = catchAsync(async (req, res, next) => {});

export const sendSixDigitTokenSMS = catchAsync(async (req, res, next) => {});

export const checkSixDigitTokenLogin = catchAsync(async (req, res, next) => {});

export const checkSixDigitTokenActivate = catchAsync(
  async (req, res, next) => {}
);

export default {
  signup,
  loginEmailPassword,
  loginPhonePassword,
  sendSixDigitTokenEmail,
  sendSixDigitTokenSMS,
};
