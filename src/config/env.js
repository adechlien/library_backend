export const config = {
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: process.env.JWT_SECRET || 'secreto_secreto',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
};
