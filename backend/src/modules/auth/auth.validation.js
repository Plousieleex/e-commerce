import { z } from 'zod';

export const authSchema = z
  .object({
    nameSurname: z.string(),
    email: z.string().email(),
    phoneNumber: z.string().optional(),
    password: z.string().min(8),
    passwordConfirm: z.string(),
  })
  .strict()
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match.",
    path: ['passwordConfirm'],
  });

export default {
  authSchema,
};
