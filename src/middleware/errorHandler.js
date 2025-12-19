// src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  if (req.log) {
    req.log.error(err);
  } else {
    console.error(err);
  }

  const status = err.status || 500;

  res.status(status).json({
    message: err.message || 'Internal server error',
  });
};

export default errorHandler;
