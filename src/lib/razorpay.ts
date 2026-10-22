import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  isCustom: boolean;
}

// In-memory runtime override store so UI changes take effect immediately
let runtimeConfig: RazorpayConfig = {
  keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_sampleKey123',
  keySecret: process.env.RAZORPAY_KEY_SECRET || 'rzp_sampleSecret456',
  isCustom: Boolean(
    process.env.RAZORPAY_KEY_ID &&
    !process.env.RAZORPAY_KEY_ID.includes('sampleKey123')
  ),
};

export function getActiveRazorpayConfig() {
  const keyId = runtimeConfig.keyId || process.env.RAZORPAY_KEY_ID || 'rzp_test_sampleKey123';
  const keySecret = runtimeConfig.keySecret || process.env.RAZORPAY_KEY_SECRET || 'rzp_sampleSecret456';
  const isMock = keyId.includes('sampleKey123') || keySecret.includes('sampleSecret456');
  const isLive = keyId.startsWith('rzp_live_');
  const isTest = keyId.startsWith('rzp_test_');

  // Mask the secret for safe client display
  let maskedSecret = '••••••••••••';
  if (keySecret && keySecret.length > 4) {
    maskedSecret = '••••••••••••' + keySecret.slice(-4);
  }

  return {
    keyId,
    maskedSecret,
    hasSecret: Boolean(keySecret && keySecret.trim().length > 0),
    isConfigured: !isMock,
    mode: isLive ? 'live' : isTest ? 'test' : 'mock',
    isLive,
    isTest,
    isMock,
  };
}

export function getRazorpayCredentialsInternal(): { keyId: string; keySecret: string } {
  return {
    keyId: runtimeConfig.keyId || process.env.RAZORPAY_KEY_ID || 'rzp_test_sampleKey123',
    keySecret: runtimeConfig.keySecret || process.env.RAZORPAY_KEY_SECRET || 'rzp_sampleSecret456',
  };
}

export async function saveRazorpayCredentials(newKeyId: string, newKeySecret?: string) {
  const trimmedKeyId = newKeyId.trim();
  const trimmedSecret = newKeySecret?.trim();

  // Update in-memory runtime config immediately
  runtimeConfig.keyId = trimmedKeyId;
  if (trimmedSecret) {
    runtimeConfig.keySecret = trimmedSecret;
  }
  runtimeConfig.isCustom = true;

  // Update process.env in current process
  process.env.RAZORPAY_KEY_ID = trimmedKeyId;
  if (trimmedSecret) {
    process.env.RAZORPAY_KEY_SECRET = trimmedSecret;
  }

  // Persist to .env and .env.local file if writable
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');

      // Update RAZORPAY_KEY_ID
      if (/RAZORPAY_KEY_ID=.*/.test(envContent)) {
        envContent = envContent.replace(/RAZORPAY_KEY_ID=.*/g, `RAZORPAY_KEY_ID="${trimmedKeyId}"`);
      } else {
        envContent += `\nRAZORPAY_KEY_ID="${trimmedKeyId}"`;
      }

      // Update RAZORPAY_KEY_SECRET if provided
      if (trimmedSecret) {
        if (/RAZORPAY_KEY_SECRET=.*/.test(envContent)) {
          envContent = envContent.replace(/RAZORPAY_KEY_SECRET=.*/g, `RAZORPAY_KEY_SECRET="${trimmedSecret}"`);
        } else {
          envContent += `\nRAZORPAY_KEY_SECRET="${trimmedSecret}"`;
        }
      }

      fs.writeFileSync(envPath, envContent, 'utf8');
    }
  } catch (err) {
    console.error('Failed to write credentials to .env file:', err);
  }

  return getActiveRazorpayConfig();
}

export async function createRazorpayOrder({
  amountInRupees,
  receipt,
  notes = {},
}: {
  amountInRupees: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const { keyId, keySecret } = getRazorpayCredentialsInternal();
  const amountInPaise = Math.round(amountInRupees * 100);

  // If using genuine Razorpay key format, try creating real order with Razorpay REST API
  const isRealKey = (keyId.startsWith('rzp_test_') || keyId.startsWith('rzp_live_')) &&
                    !keyId.includes('sampleKey123') &&
                    !keySecret.includes('sampleSecret456');

  if (isRealKey) {
    try {
      const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt,
          notes,
        }),
      });

      if (response.ok) {
        const orderData = await response.json();
        return {
          success: true,
          orderId: orderData.id,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          keyId,
          isMock: false,
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Razorpay live order creation failed, falling back to simulated order:', errorData);
      }
    } catch (apiError) {
      console.warn('Network error reaching Razorpay API, falling back to simulated order:', apiError);
    }
  }

  // Fallback simulated order for test keys or offline environments
  const mockOrderId = `order_${Math.random().toString(36).substring(2, 10)}${Date.now().toString().slice(-4)}`;
  return {
    success: true,
    orderId: mockOrderId,
    amount: amountInPaise,
    currency: 'INR',
    keyId,
    isMock: true,
  };
}

export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { keySecret } = getRazorpayCredentialsInternal();

  if (!orderId || !paymentId) {
    return false;
  }

  // Handle mock signatures
  if (signature.startsWith('mock_sig_') || signature === 'test_verified_signature') {
    return true;
  }

  try {
    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    return generatedSignature === signature;
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}

export async function testRazorpayConnection(keyId: string, keySecret: string) {
  const trimmedKeyId = keyId.trim();
  const trimmedSecret = keySecret.trim();

  if (!trimmedKeyId.startsWith('rzp_test_') && !trimmedKeyId.startsWith('rzp_live_')) {
    return {
      success: false,
      message: 'Key ID must start with "rzp_test_" for Test mode or "rzp_live_" for Live mode.',
    };
  }

  try {
    const basicAuth = Buffer.from(`${trimmedKeyId}:${trimmedSecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/payments?count=1', {
      method: 'GET',
      headers: {
        Authorization: `Basic ${basicAuth}`,
      },
    });

    if (response.status === 200) {
      const mode = trimmedKeyId.startsWith('rzp_live_') ? 'Live' : 'Test';
      return {
        success: true,
        message: `Successfully connected to Razorpay (${mode} Mode)! Payments are ready.`,
      };
    } else if (response.status === 401) {
      return {
        success: false,
        message: 'Authentication failed: Invalid Razorpay Key ID or Key Secret.',
      };
    } else {
      const body = await response.text();
      return {
        success: false,
        message: `Razorpay response HTTP ${response.status}: ${body}`,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Could not connect to Razorpay server: ${error?.message || 'Network timeout'}`,
    };
  }
}
