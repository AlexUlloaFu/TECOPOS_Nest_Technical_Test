import type { SASLOptions } from 'kafkajs';
import type { ConnectionOptions } from 'tls';

type SupportedSaslMechanism = 'plain' | 'scram-sha-256' | 'scram-sha-512';

const DEFAULT_KAFKA_BROKERS = 'kafka:9092';
const DEFAULT_SASL_MECHANISM: SupportedSaslMechanism = 'plain';

function parseKafkaBrokers(): string[] {
  return (process.env.KAFKA_BROKERS || DEFAULT_KAFKA_BROKERS)
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);
}

function parseSaslMechanism(): SupportedSaslMechanism {
  const mechanism = process.env.KAFKA_SASL_MECHANISM;
  if (mechanism === 'scram-sha-256' || mechanism === 'scram-sha-512') {
    return mechanism;
  }
  return DEFAULT_SASL_MECHANISM;
}

function parseSaslOptions(): SASLOptions | undefined {
  const username = process.env.KAFKA_SASL_USERNAME;
  const password = process.env.KAFKA_SASL_PASSWORD;

  if (!username || !password) {
    return undefined;
  }

  return {
    mechanism: parseSaslMechanism(),
    username,
    password,
  } as SASLOptions;
}

function parseKafkaSslOptions(): true | ConnectionOptions | undefined {
  const sslEnabled = process.env.KAFKA_SSL === 'true';
  if (!sslEnabled) {
    return undefined;
  }

  const rejectUnauthorizedRaw = process.env.KAFKA_SSL_REJECT_UNAUTHORIZED;
  const rejectUnauthorized =
    rejectUnauthorizedRaw === undefined
      ? true
      : rejectUnauthorizedRaw.toLowerCase() !== 'false';

  const caBase64 = process.env.KAFKA_SSL_CA_BASE64;
  if (caBase64 && caBase64.trim().length > 0) {
    const ca = Buffer.from(caBase64, 'base64').toString('utf8');
    return { rejectUnauthorized, ca: [ca] };
  }

  if (!rejectUnauthorized) {
    return { rejectUnauthorized: false };
  }

  return true;
}

export function buildKafkaClientOptions(clientId: string): {
  clientId: string;
  brokers: string[];
  ssl?: true | ConnectionOptions;
  sasl?: SASLOptions;
} {
  const ssl = parseKafkaSslOptions();
  const sasl = parseSaslOptions();

  return {
    clientId,
    brokers: parseKafkaBrokers(),
    ...(ssl ? { ssl } : {}),
    ...(sasl ? { sasl } : {}),
  };
}
