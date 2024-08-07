export interface KafkaConfig {
  certificates?: {
    key: string;
    cert: string;
    ca: string;
    rejectUnauthorized: boolean;
  };
  sasl?: {
    mechanism: 'plain';
    username: string;
    password: string;
  } | {
    mechanism: 'scram-sha-256';
    username: string;
    password: string;
  } | {
    mechanism: 'scram-sha-512';
    username: string;
    password: string;
  };
  ssl?: boolean;
  groupId: string;
  clientId: string;
  brokers: string[];
  producer: {
    brokers: string[];
    certificates?: {
      rejectUnauthorized: boolean;
      key: string;
      cert: string;
      ca: string;
    };
    ssl?: boolean;
    sasl?: {
      mechanism: 'plain';
      username: string;
      password: string;
    } | {
      mechanism: 'scram-sha-256';
      username: string;
      password: string;
    } | {
      mechanism: 'scram-sha-512';
      username: string;
      password: string;
    };
  };
  log?: {
    level: 'info' | 'debug' | 'error' | 'warn' | 'nothing';
    errorToWarn: string[];
  };
  connectionTimeout?: number;
  authenticationTimeout?: number;
}
