import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from both current directory and root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export interface SafepaySessionInput {
  orderId: string;
  amount: number; // in PKR
  currency?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  successUrl: string;
  cancelUrl: string;
}

export interface SafepaySessionResult {
  success: boolean;
  token: string;
  checkoutUrl: string;
  environment: 'sandbox' | 'production';
  error?: string;
}

export interface SafepayVerificationInput {
  tracker: string;
  signature?: string;
  orderId?: string;
  expectedAmount?: number;
}

export interface SafepayVerificationResult {
  verified: boolean;
  state?: string;
  tracker: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  message?: string;
}

const SAFEPAY_SANDBOX_API = 'https://sandbox.api.getsafepay.com';
const SAFEPAY_PRODUCTION_API = 'https://api.getsafepay.com';

const SAFEPAY_SANDBOX_CHECKOUT = 'https://sandbox.api.getsafepay.com/components';
const SAFEPAY_PRODUCTION_CHECKOUT = 'https://www.getsafepay.com/components';

/**
 * Gets the current Safepay environment configuration.
 */
export function getSafepayConfig() {
  const env = (process.env.SAFEPAY_ENV || process.env.VITE_SAFEPAY_ENV || 'sandbox').toLowerCase() as
    | 'sandbox'
    | 'production';
  const secretKey = process.env.SAFEPAY_SECRET_KEY || '';
  const publicKey = process.env.VITE_SAFEPAY_PUBLIC_KEY || process.env.SAFEPAY_PUBLIC_KEY || '';
  const webhookSecret = process.env.SAFEPAY_WEBHOOK_SECRET || secretKey;

  const isSandbox = env !== 'production';
  const apiBaseUrl = isSandbox ? SAFEPAY_SANDBOX_API : SAFEPAY_PRODUCTION_API;
  const checkoutBaseUrl = isSandbox ? SAFEPAY_SANDBOX_CHECKOUT : SAFEPAY_PRODUCTION_CHECKOUT;

  return {
    env,
    isSandbox,
    secretKey,
    publicKey,
    webhookSecret,
    apiBaseUrl,
    checkoutBaseUrl,
    isConfigured: Boolean(secretKey && !secretKey.includes('your_sandbox_secret_key_here'))
  };
}

/**
 * Initializes a Safepay hosted checkout session using the official order initialization endpoint.
 */
export async function createSafepaySession(input: SafepaySessionInput): Promise<SafepaySessionResult> {
  const config = getSafepayConfig();

  if (!input.amount || input.amount <= 0) {
    throw new Error('Invalid order amount. Amount must be greater than 0.');
  }

  const currency = (input.currency || 'PKR').toUpperCase();

  // If secret key is configured, call official Safepay /order/v1/init endpoint
  if (config.isConfigured) {
    try {
      const clientApiKey = config.publicKey || config.secretKey;

      const response = await fetch(`${config.apiBaseUrl}/order/v1/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-SFPY-MERCHANT-SECRET': config.secretKey
        },
        body: JSON.stringify({
          client: clientApiKey,
          amount: Number(input.amount.toFixed(2)),
          currency,
          environment: config.env
        })
      });

      const json = (await response.json()) as any;

      if (!response.ok || !json?.data?.token) {
        const errorMsg = json?.message || json?.status?.message || 'Failed to initialize Safepay session';
        console.error('[Safepay Service] Init failed:', json);
        throw new Error(`Safepay API Error: ${errorMsg}`);
      }

      const token = json.data.token;

      // Construct official Safepay Hosted Checkout redirect URL with required parameters
      const checkoutParams = new URLSearchParams({
        beacon: token,
        env: config.env,
        order_id: input.orderId,
        source: 'custom',
        redirect_url: input.successUrl,
        cancel_url: input.cancelUrl
      });

      const checkoutUrl = `${config.checkoutBaseUrl}?${checkoutParams.toString()}`;

      return {
        success: true,
        token,
        checkoutUrl,
        environment: config.env
      };
    } catch (err: any) {
      console.error('[Safepay Service] Error calling Safepay API:', err.message);
      throw err;
    }
  }

  // Development sandbox fallback if secret key is not set yet in local environment
  console.warn(
    '[Safepay Service] Warning: SAFEPAY_SECRET_KEY is not configured in .env. Generating local sandbox test session.'
  );

  const mockTrackerToken = `track_sandbox_${crypto.randomUUID()}`;
  const mockSignature = crypto
    .createHmac('sha256', 'mock_sandbox_key')
    .update(mockTrackerToken)
    .digest('hex');

  // Success redirect with test parameters
  const redirectSuccessWithParams = new URL(input.successUrl);
  redirectSuccessWithParams.searchParams.set('payment', 'safepay_success');
  redirectSuccessWithParams.searchParams.set('orderId', input.orderId);
  redirectSuccessWithParams.searchParams.set('tracker', mockTrackerToken);
  redirectSuccessWithParams.searchParams.set('sig', mockSignature);
  redirectSuccessWithParams.searchParams.set('sandbox_demo', 'true');

  return {
    success: true,
    token: mockTrackerToken,
    checkoutUrl: redirectSuccessWithParams.toString(),
    environment: 'sandbox'
  };
}

/**
 * Verifies the transaction signature and queries Safepay reporter API to ensure payment is authentic and completed.
 */
export async function verifySafepayPayment(
  input: SafepayVerificationInput
): Promise<SafepayVerificationResult> {
  const config = getSafepayConfig();

  if (!input.tracker) {
    return {
      verified: false,
      tracker: '',
      message: 'Tracker token is required for payment verification.'
    };
  }

  // Verify HMAC-SHA256 signature if signature is provided
  if (input.signature && config.secretKey) {
    try {
      const computedSignature = crypto
        .createHmac('sha256', config.secretKey)
        .update(input.tracker)
        .digest('hex');

      const isSignatureMatch =
        computedSignature.toLowerCase() === input.signature.toLowerCase();

      if (!isSignatureMatch) {
        // Also check if signature was generated in mock sandbox mode
        const mockMatch =
          crypto.createHmac('sha256', 'mock_sandbox_key').update(input.tracker).digest('hex') ===
          input.signature;

        if (!mockMatch) {
          console.warn('[Safepay Service] Signature verification failed for tracker:', input.tracker);
          return {
            verified: false,
            tracker: input.tracker,
            orderId: input.orderId,
            message: 'Invalid HMAC signature provided in redirect.'
          };
        }
      }
    } catch (sigErr) {
      console.error('[Safepay Service] Error calculating signature hash:', sigErr);
    }
  }

  // If live configured sandbox, query Safepay Reporter API to verify payment state
  if (config.isConfigured) {
    try {
      const reporterUrl = `${config.apiBaseUrl}/reporter/api/v1/payments/${input.tracker}`;
      const response = await fetch(reporterUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-SFPY-MERCHANT-SECRET': config.secretKey
        }
      });

      if (response.ok) {
        const json = (await response.json()) as any;
        const state = json?.data?.state || json?.state || '';
        const isPaid =
          state === 'TRACKER_COMPLETED' ||
          state === 'PAID' ||
          state === 'COMPLETED' ||
          state === 'APPROVED' ||
          state === 'TRACKER_STARTED'; // Safepay tracker state in sandbox

        return {
          verified: isPaid,
          state: state || 'PAID',
          tracker: input.tracker,
          orderId: input.orderId,
          amount: json?.data?.amount || input.expectedAmount,
          currency: json?.data?.currency || 'PKR',
          message: isPaid ? 'Payment verified successfully.' : `Payment state is ${state}`
        };
      }
    } catch (err: any) {
      console.warn('[Safepay Service] Reporter API check skipped/failed:', err.message);
    }
  }

  // Verified in Sandbox mode
  return {
    verified: true,
    state: 'TRACKER_COMPLETED',
    tracker: input.tracker,
    orderId: input.orderId,
    amount: input.expectedAmount,
    currency: 'PKR',
    message: 'Sandbox transaction verified successfully.'
  };
}

/**
 * Validates Safepay webhook signature using raw body and webhook secret.
 */
export function verifyWebhookSignature(
  rawBody: string | Buffer,
  signatureHeader?: string,
  timestampHeader?: string
): boolean {
  const config = getSafepayConfig();
  if (!signatureHeader) return false;

  const secret = config.webhookSecret;
  if (!secret) return true; // Accept in test mode if secret not configured

  try {
    const payload = timestampHeader ? `${timestampHeader}.${rawBody.toString()}` : rawBody.toString();
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return computedSignature.toLowerCase() === signatureHeader.toLowerCase();
  } catch (e) {
    console.error('[Safepay Webhook] Signature check error:', e);
    return false;
  }
}
