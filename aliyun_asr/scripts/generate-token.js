#!/usr/bin/env node

/**
 * Aliyun Token Generator
 *
 * This script generates a temporary access token for Aliyun ISI service.
 *
 * SECURITY WARNING:
 * - NEVER expose your AccessKeySecret in frontend code
 * - NEVER commit credentials to version control
 * - In production, implement a backend service to generate tokens
 *
 * Usage:
 *   node scripts/generate-token.js
 *
 * Or with environment variables:
 *   ACCESS_KEY_ID=xxx ACCESS_KEY_SECRET=xxx node scripts/generate-token.js
 */

const crypto = require('crypto');
const https = require('https');

// Configuration
const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID || '';
const ACCESS_KEY_SECRET = process.env.ACCESS_KEY_SECRET || '';

if (!ACCESS_KEY_ID || !ACCESS_KEY_SECRET) {
  console.error('Error: ACCESS_KEY_ID and ACCESS_KEY_SECRET are required');
  console.error('\nUsage:');
  console.error('  ACCESS_KEY_ID=your_id ACCESS_KEY_SECRET=your_secret node scripts/generate-token.js');
  console.error('\nOr create a .env file with:');
  console.error('  ACCESS_KEY_ID=your_id');
  console.error('  ACCESS_KEY_SECRET=your_secret');
  process.exit(1);
}

/**
 * Generate UUID for SignatureNonce
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Encode parameter value according to RFC 3986
 */
function percentEncode(value) {
  return encodeURIComponent(value)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

/**
 * Generate HMAC-SHA1 signature
 */
function generateSignature(method, params, accessKeySecret) {
  // Sort parameters alphabetically
  const sortedKeys = Object.keys(params).sort();

  // Build canonical query string
  const canonicalQueryString = sortedKeys
    .map(key => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join('&');

  // Build string to sign
  const stringToSign = `${method}&${percentEncode('/')}&${percentEncode(canonicalQueryString)}`;

  // Calculate signature
  const hmac = crypto.createHmac('sha1', `${accessKeySecret}&`);
  hmac.update(stringToSign);
  return hmac.digest('base64');
}

/**
 * Create token via Aliyun OpenAPI
 */
async function createToken() {
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

  const params = {
    AccessKeyId: ACCESS_KEY_ID,
    Action: 'CreateToken',
    Version: '2019-02-28',
    Format: 'JSON',
    RegionId: 'cn-shanghai',
    Timestamp: timestamp,
    SignatureMethod: 'HMAC-SHA1',
    SignatureVersion: '1.0',
    SignatureNonce: generateUUID()
  };

  // Generate signature
  const signature = generateSignature('GET', params, ACCESS_KEY_SECRET);
  params.Signature = signature;

  // Build query string
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  const url = `https://nls-meta.cn-shanghai.aliyuncs.com/?${queryString}`;

  console.log('Requesting token from Aliyun...\n');

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (res.statusCode === 200) {
            const token = response.Token.Id;
            const expireTime = response.Token.ExpireTime;
            const expireDate = new Date(expireTime * 1000);

            console.log('✅ Token generated successfully!\n');
            console.log('Token:');
            console.log(token);
            console.log('\nExpires at:', expireDate.toLocaleString());
            console.log('Valid for:', Math.floor((expireTime * 1000 - Date.now()) / 1000 / 60 / 60), 'hours\n');
            console.log('Copy this token to use in your application.');

            resolve(token);
          } else {
            console.error('❌ Failed to generate token\n');
            console.error('Status:', res.statusCode);
            console.error('Response:', JSON.stringify(response, null, 2));
            reject(new Error(`Failed with status ${res.statusCode}`));
          }
        } catch (err) {
          console.error('❌ Error parsing response:', err.message);
          console.error('Raw response:', data);
          reject(err);
        }
      });
    }).on('error', (err) => {
      console.error('❌ Request error:', err.message);
      reject(err);
    });
  });
}

// Run
createToken()
  .then(() => {
    console.log('\n💡 Security Tip:');
    console.log('In production, implement a backend API to generate tokens.');
    console.log('Never expose AccessKeySecret in frontend code!\n');
  })
  .catch((err) => {
    console.error('\nError:', err.message);
    process.exit(1);
  });
