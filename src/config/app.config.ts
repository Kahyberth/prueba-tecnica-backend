import * as joi from 'joi';

export const appConfigSchema = joi
  .object({
    PORT: joi.number().default(3000),
    DATABASE_URL: joi.string().required(),
    JWT_SECRET: joi.string().required(),
    FRONTEND_URL: joi.string().required(),
  })
  .unknown(true);
