import catchAsync from '../../utils/catchAsync';

export const validateAuthSchema = (schema) => {
  catchAsync(async (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const customError = result.error.issues.reduce((acc, issue) => {
        const field = issue.path.join('.');

        if (!acc[field]) {
          acc[field] = issue.message;
        }

        return acc;
      }, {});

      return res.status(400).json({
        status: 'fail',
        errors: customError,
      });
    }

    req.body = result.data;
    next();
  });
};

export default {
  validateAuthSchema,
};
