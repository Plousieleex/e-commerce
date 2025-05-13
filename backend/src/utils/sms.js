import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

export async function createVerification(phoneNumber) {
  const verification = await client.verify.v2
    .services(process.env.TWILIO_SERVICE_SID)
    .verifications.create({ channel: 'sms', to: phoneNumber });

  console.log(verification);
}

export async function createVerificationCheck(code, phoneNumber) {
  const verificationCheck = await client.verify.v2
    .services(process.env.TWILIO_SERVICE_SID)
    .verificationChecks.create({ code: code, to: phoneNumber });

  console.log(verificationCheck);
}

export default {
  createVerification,
  createVerificationCheck,
};
