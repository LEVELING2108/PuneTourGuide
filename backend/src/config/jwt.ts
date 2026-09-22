import dotenv from 'dotenv';
dotenv.config();

const resolveJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is missing in production.');
    }
    console.warn(
      '[SECURITY WARNING] JWT_SECRET is not set in environment. Falling back to a local development secret. Set JWT_SECRET in your backend/.env file.'
    );
    return 'pune_tour_guide_dev_secret_insecure_local_only';
  }

  if (process.env.NODE_ENV === 'production' && secret === 'pune_tour_guide_secret_key') {
    throw new Error('FATAL: Insecure default JWT_SECRET used in production.');
  }

  return secret;
};

export const JWT_SECRET = resolveJwtSecret();
