import * as Joi from 'joi';

export function validateConfig(config: Record<string, unknown>) {
  const schema = Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'staging', 'production', 'test')
      .required(),
    PORT: Joi.number().default(4000),
    FRONTEND_URL: Joi.string().uri().required(),
    ADMIN_URL: Joi.string().uri().required(),

    // Database
    DATABASE_URL: Joi.string().required(),
    SHADOW_DATABASE_URL: Joi.string().optional(),
    REDIS_URL: Joi.string().optional(),

    // Auth
    JWT_ACCESS_SECRET: Joi.string().min(32).required(),
    JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
    JWT_REFRESH_SECRET: Joi.string().min(32).required(),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

    // AWS S3 (optional in dev)
    AWS_REGION: Joi.string().optional(),
    AWS_ACCESS_KEY_ID: Joi.string().optional(),
    AWS_SECRET_ACCESS_KEY: Joi.string().optional(),
    AWS_S3_BUCKET: Joi.string().optional(),

    // Razorpay (optional in dev)
    RAZORPAY_KEY_ID: Joi.string().optional(),
    RAZORPAY_KEY_SECRET: Joi.string().optional(),
    RAZORPAY_WEBHOOK_SECRET: Joi.string().optional(),
  });

  const { error, value } = schema.validate(config, {
    allowUnknown: true,
    abortEarly: false,
  });

  if (error) {
    throw new Error(
      `❌ Config validation failed:\n${error.details.map(d => `  • ${d.message}`).join('\n')}`,
    );
  }

  return value;
}
