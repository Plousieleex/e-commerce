import { Router } from 'express';
import authController from './auth.controller.js';
import authMiddleware from './auth.middleware.js';
import authValidation from './auth.validation.js';

const router = Router();

router
  .route('/')
  .post(
    authMiddleware.validateAuthSchema(authValidation.authSchema),
    authController.signup
  );

router.route('/activate').post(authController.checkSixDigitTokenActivate);

router.route('/resend').post(authController.resendActivationCode);

router.route('/verification').post(authController.sendSixDigitTokenSMS);
router
  .route('/verification/check')
  .post(authController.checkSixDigitTokenLogin);

export default router;
