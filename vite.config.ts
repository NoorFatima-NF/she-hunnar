import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import {
  createSafepaySession,
  verifySafepayPayment,
  getSafepayConfig,
  verifyWebhookSignature
} from './server/safepayService.ts';

// Ensure environment variables are loaded
dotenv.config();

function safepayApiPlugin(): Plugin {
  return {
    name: 'safepay-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/safepay')) {
          return next();
        }

        const url = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
        const pathname = url.pathname;

        res.setHeader('Content-Type', 'application/json');

        try {
          if (pathname === '/api/safepay/config' && req.method === 'GET') {
            const config = getSafepayConfig();
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                success: true,
                environment: config.env,
                isSandbox: config.isSandbox,
                publicKey: config.publicKey,
                hasSecretKey: config.isConfigured
              })
            );
            return;
          }

          if (pathname === '/api/safepay/create-session' && req.method === 'POST') {
            let bodyStr = '';
            for await (const chunk of req) {
              bodyStr += chunk;
            }
            const body = bodyStr ? JSON.parse(bodyStr) : {};
            const { orderId, amount, currency, customer, successUrl, cancelUrl } = body;

            if (!orderId || !amount) {
              res.statusCode = 400;
              res.end(
                JSON.stringify({
                  success: false,
                  error: 'Missing required order details: orderId and amount are required.'
                })
              );
              return;
            }

            const origin = `http://${req.headers.host || 'localhost:3000'}`;
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

            res.statusCode = 200;
            res.end(
              JSON.stringify({
                success: true,
                token: session.token,
                checkoutUrl: session.checkoutUrl,
                environment: session.environment
              })
            );
            return;
          }

          if (pathname === '/api/safepay/verify-payment' && req.method === 'POST') {
            let bodyStr = '';
            for await (const chunk of req) {
              bodyStr += chunk;
            }
            const body = bodyStr ? JSON.parse(bodyStr) : {};
            const { tracker, signature, orderId, expectedAmount } = body;

            if (!tracker) {
              res.statusCode = 400;
              res.end(
                JSON.stringify({
                  success: false,
                  verified: false,
                  error: 'Missing payment tracker token'
                })
              );
              return;
            }

            const verification = await verifySafepayPayment({
              tracker,
              signature,
              orderId,
              expectedAmount: expectedAmount ? Number(expectedAmount) : undefined
            });

            if (!verification.verified) {
              res.statusCode = 400;
              res.end(
                JSON.stringify({
                  success: false,
                  verified: false,
                  message: verification.message || 'Payment verification failed'
                })
              );
              return;
            }

            res.statusCode = 200;
            res.end(
              JSON.stringify({
                success: true,
                verified: true,
                paymentStatus: 'Paid',
                transactionRef: verification.tracker,
                orderId: verification.orderId || orderId,
                verifiedAt: new Date().toISOString(),
                message: 'Payment verified successfully.'
              })
            );
            return;
          }

          if (pathname === '/api/safepay/webhook' && req.method === 'POST') {
            let rawBody = '';
            for await (const chunk of req) {
              rawBody += chunk;
            }
            const sig = (req.headers['x-sfpy-signature'] || req.headers['signature']) as string;
            const timestamp = req.headers['x-sfpy-timestamp'] as string;

            const isVerified = verifyWebhookSignature(rawBody, sig, timestamp);
            if (!isVerified) {
              res.statusCode = 401;
              res.end(JSON.stringify({ error: 'Invalid webhook signature' }));
              return;
            }

            res.statusCode = 200;
            res.end(JSON.stringify({ received: true }));
            return;
          }

          next();
        } catch (err: any) {
          console.error('[Safepay Dev Server Middleware Error]:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), safepayApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
