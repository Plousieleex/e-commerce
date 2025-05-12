import AppError from '../src/utils/AppError.js';

const handlePrismaClientValidationErrorDB = () => {
  const message = `Invalid input.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const message = err.message || `Duplicate value error.`;
  return new AppError(message, 400);
};

const handleRecordNotFoundError = (err) => {
  const message = err.meta?.cause || 'Record not found.';
  return new AppError(message, 404);
};

const handlePrismaClientInitializationError = () => {
  const message = 'Something went bad.';
  return new AppError(message, 500);
};

const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again.', 401);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
    code: err.code,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error.',
    });
  }
};

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (error.name === 'PrismaClientValidationError') {
      error = handlePrismaClientValidationErrorDB();
    }

    if (error.code === 'P2002') {
      error = handleDuplicateFieldsDB(error);
    }

    if (error.code === 'P2025') {
      error = handleRecordNotFoundError(error);
    }

    if (error.name === 'PrismaClientInitializationError') {
      error = handlePrismaClientInitializationError();
    }

    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }

    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    sendErrorProd(error, res);
  }
};

export default errorMiddleware;
