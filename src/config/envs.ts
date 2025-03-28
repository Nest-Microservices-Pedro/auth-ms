import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  NATS_SERVERS: string[];
}

const envVarsSchema: joi.ObjectSchema = joi
  .object({
    NATS_SERVERS: joi.array().items(joi.string()).required(),
  })
  .unknown(true);

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { error, value } = envVarsSchema.validate({
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) throw new Error(`Config validation error: ${error.message}`);

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const envVars: EnvVars = value;

export const envs = {
  natsServers: envVars.NATS_SERVERS,
};
