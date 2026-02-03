export const config = {
  PORT: Number(process.env.PORT || 3000),
  DATABASE_URL: process.env.DATABASE_URL,
  SALT_ROUNDS: 10,
  JWT_SECRET: process.env.JWT_SECRET,
};
