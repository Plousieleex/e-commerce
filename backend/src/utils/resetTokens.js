import crypto from 'crypto';

export async function createSixDigitToken() {
  const randomCode = crypto.randomInt(0, 1_000_000);
  const finalRandomCode = String(randomCode).padStart(6, '0');

  const hashedFinalRandomCode = crypto
    .createHash('sha256')
    .update(finalRandomCode)
    .digest('hex');

  return { finalRandomCode, hashedFinalRandomCode };
}

export default {
  createSixDigitToken,
};
