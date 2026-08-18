import { Router, Request, Response } from 'express';
import {
  createSafepaySession,
  verifySafepayPayment,
  verifyWebhookSignature,
  getSafepayConfig
} from '../safepayService.js';

export const safepayRouter = Router();

/**
 * GET /api/safepay/config
 * Returns public configuration and environment info (never exposes secret key).
 */
safepayRouter.get('/config', (req: Request, res: Response) => {
  const config = getSafepayConfig();
  res.json({
    success: true,
    environment: config.env,
    isSandbox: config.isSandbox,
    publicKey: config.publicKey,
    hasSecretKey: config.isConfigured
  });
});

/**
 * POST /api/safepay/create-session
 * Initializes a payment session on Safepay Sandbox and returns the redirect checkout URL.
 */
safepayRouter.post('/create-session', async (req: Request, res: Response) => {
  try {
    const { orderId, amount, currency, customer, successUrl, cancelUrl } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required order details: orderId and amount are required.'
      });
    }

    // Default fallback URLs if not provided by client
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:3000';
    const origin = req.get('origin') || `${protocol}://${host}`;

    const finalSuccessUrl =
      successUrl ||
      `${origin}/?payment=safepay_success&orderId=${encodeURIComponent(orderId)}`;
    const finalCancelUrl =
      cancelUrl ||
      `${origin}/?payment=safepay_cancel&orderId=${encodeURIComponent(orderId)}`;

    const session = await createSafepaySession({
      orderId,
      amount: Number(amount),
      currency: currency || 'PKR',
      customer,
      successUrl: finalSuccessUrl,
      cancelUrl: finalCancelUrl
    });

    res.json({
      success: true,
      token: session.token,
      checkoutUrl: session.checkoutUrl,
      environment: session.environment
    });
  } catch (error: any) {
    console.error('[API /api/safepay/create-session] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create Safepay checkout session'
    });
  }
});

/**
 * POST /api/safepay/verify-payment
 * Verifies the payment with Safepay using HMAC signature & reporter API before updating order status.
 */
safepayRouter.post('/verify-payment', async (req: Request, res: Response) => {
  try {
    const { tracker, signature, orderId, expectedAmount } = req.body;

    if (!tracker) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Missing payment tracker token'
      });
    }

    const verification = await verifySafepayPayment({
      tracker,
      signature,
      orderId,
      expectedAmount: expectedAmount ? Number(expectedAmount) : undefined
    });

    if (!verification.verified) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: verification.message || 'Payment verification failed'
      });
    }

    res.json({
      success: true,
      verified: true,
      paymentStatus: 'Paid',
      transactionRef: verification.tracker,
      orderId: verification.orderId || orderId,
      verifiedAt: new Date().toISOString(),
      message: 'Payment verified successfully.'
    });
  } catch (error: any) {
    console.error('[API /api/safepay/verify-payment] Error:', error);
    res.status(500).json({
      success: false,
      verified: false,
      error: error.message || 'Payment verification error'
    });
  }
});

/**
 * POST /api/safepay/webhook
 * Listens for Safepay webhook events (e.g. payment.completed) and updates order status.
 */
safepayRouter.post('/webhook', (req: Request, res: Response) => {
  try {
    const signature = (req.headers['x-sfpy-signature'] || req.headers['signature']) as string | undefined;
    const timestamp = req.headers['x-sfpy-timestamp'] as string | undefined;
    const rawBody = req.body;

    const isVerified = verifyWebhookSignature(
      typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody),
      signature,
      timestamp
    );

    if (!isVerified) {
      console.warn('[Safepay Webhook] Rejected unauthorized webhook payload');
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    console.log('[Safepay Webhook] Received verified event:', event?.type || event?.event || 'payment');

    // Return 200 OK to acknowledge Safepay webhook delivery
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('[Safepay Webhook] Error:', error);
    res.status(400).json({ error: error.message });
  }
});
