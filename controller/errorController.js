const AppError = require('../utils/appError');

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
};

const sendErrorPro = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      console.log(err);

      res.status(500).json({
        status: 'error',
        message: 'Something went wrong',
      });
    }
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
};

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateError = (err) => {
  const value = Object.values(err.keyValue)[0];
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const message = Object.values(err.errors)
    .map((el) => el.message)
    .join('. ');
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid Token. Please login', 401);

const handleTokenExpiredError = () =>
  new AppError('Token expired. Please login again', 401);

const handleLimitFileMulter = () =>
  new AppError('Too many files. Please upload correct quantity', 400);

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV !== 'production') {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err, message: err.message };

    switch (err.name) {
      case 'CastError':
        error = handleCastError(error);
        break;
      case 'ValidationError':
        error = handleValidationError(error);
        break;
      case 'JsonWebTokenError':
        error = handleJWTError();
        break;
      case 'TokenExpiredError':
        error = handleTokenExpiredError();
        break;
      default:
        break;
    }

    switch (err.code) {
      case 11000:
        error = handleDuplicateError(error);
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        error = handleLimitFileMulter();
        break;
      default:
        break;
    }
    sendErrorPro(error, req, res);
  }
};

module.exports = globalErrorHandler;
