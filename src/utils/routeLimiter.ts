import rateLimit from 'express-rate-limit';

export const routeLimiter = (maxNumberOfRequest: number) =>
  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: maxNumberOfRequest,
    message: 'Too many requests, please try again after an hour',
  });
