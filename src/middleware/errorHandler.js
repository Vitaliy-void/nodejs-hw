import { HttpError } from 'http-errors';

export const errorHandler = (err, req, res, next) => {
  if (req.log) {
    req.log.error(err);
  } else {
    console.error(err);
  }

  let status = 500;
  let message = 'Internal server error';

  if (err instanceof HttpError) {
    status = err.statusCode || err.status || 500;
    message = err.message;
  } else if (err.message) {
    message = err.message;
  }

  res.status(status).json({ message });
};
