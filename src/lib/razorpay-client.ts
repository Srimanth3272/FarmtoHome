'use client';

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface RazorpayCheckoutOptions {
  amountInRupees: number;
  orderNumber?: string;
  farmerCommissionId?: string;
  notes?: Record<string, string>;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onFailure?: (error: any) => void;
  onDismiss?: () => void;
}

export async function initiateRazorpayPayment(options: RazorpayCheckoutOptions): Promise<{
  openedStandardCheckout: boolean;
  orderData?: any;
  error?: string;
}> {
  try {
    // 1. Create order on backend
    const orderRes = await fetch('/api/payment/razorpay/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: options.amountInRupees,
        receipt: options.orderNumber || `rcpt_${Date.now()}`,
        notes: options.notes || {},
      }),
    });

    if (!orderRes.ok) {
      const err = await orderRes.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to initiate Razorpay order');
    }

    const orderData = await orderRes.json();
    const scriptLoaded = await loadRazorpayScript();

    // 2. If Razorpay SDK is available and key is configured
    if (scriptLoaded && typeof (window as any).Razorpay === 'function') {
      const rzpOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Farm to Home',
        description: options.orderNumber
          ? `Order #${options.orderNumber} - Farm to Home`
          : 'Farm Platform Facilitation Settlement',
        image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=256&q=80',
        order_id: orderData.orderId,
        prefill: {
          name: options.customerName || 'Farm Customer',
          email: options.customerEmail || 'customer@farmtohome.in',
          contact: options.customerPhone || '+91 99887 66554',
        },
        theme: {
          color: '#1E3A2F', // Forest green theme
        },
        modal: {
          ondismiss: () => {
            if (options.onDismiss) options.onDismiss();
          },
        },
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const verifyRes = await fetch('/api/payment/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderNumber: options.orderNumber,
                farmerCommissionId: options.farmerCommissionId,
              }),
            });

            if (!verifyRes.ok) {
              const verifyErr = await verifyRes.json().catch(() => ({}));
              throw new Error(verifyErr.error || 'Payment signature verification failed');
            }

            options.onSuccess(response);
          } catch (verifyError) {
            if (options.onFailure) options.onFailure(verifyError);
          }
        },
      };

      try {
        const rzp = new (window as any).Razorpay(rzpOptions);
        rzp.on('payment.failed', function (resp: any) {
          if (options.onFailure) options.onFailure(resp.error);
        });
        rzp.open();
        return { openedStandardCheckout: true, orderData };
      } catch (err: any) {
        console.warn('Standard Razorpay popup blocked or failed to initialize:', err);
      }
    }

    // 3. Fallback: Return order data so application can render simulated modal
    return { openedStandardCheckout: false, orderData };
  } catch (error: any) {
    if (options.onFailure) options.onFailure(error);
    return { openedStandardCheckout: false, error: error.message };
  }
}
