import rateLimit from 'express-rate-limit';

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 80, // limit each IP to 80 requests per windowMs
  message: 'Too many requests from this IP, please try after a minute.',
});

export default rateLimiter;