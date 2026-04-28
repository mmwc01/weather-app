import type { Config } from 'jest';

const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
} satisfies Config;

export default config;
