/* eslint-disable @typescript-eslint/no-require-imports */
const { readFileSync } = require('fs');
const { resolve } = require('path');

const envPath = resolve(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');

for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIndex = trimmed.indexOf('=');
  if (eqIndex === -1) continue;
  const key = trimmed.slice(0, eqIndex).trim();
  let value = trimmed.slice(eqIndex + 1).trim();
  // Strip surrounding quotes
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

module.exports = async function () {
  // globalSetup — env is set before any worker spawns
};
