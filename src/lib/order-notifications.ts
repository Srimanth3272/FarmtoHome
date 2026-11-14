import fs from 'fs';
import path from 'path';
import { sendDirectWhatsAppToOwner } from './whatsapp-service';

export const OWNER_PHONE = '9347405899';
export const OWNER_EMAIL = 'sreemanthnagalakunta@gmail.com';

const DATA_DIR = path.join(process.cwd(), 'data');
const OWNER_ALERTS_FILE = path.join(DATA_DIR, 'owner-order-alerts.json');

export interface DeliveryAlertPayload {
  orderNumber: string;
  orderId?: string;
  timestamp: string;
  ownerEmail: string;
  ownerPhone: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliverySlot?: string;
  items: Array<{
    productName: string;
    productUnit?: string;
    quantity: number;
    priceAtPurchase: number;
    itemTotal: number;
  }>;
  subtotal: number;
  shippingFee: number;
  discountAmount?: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: 'TRANSMITTED_TO_OWNER';
  whatsappUrl: string;
  mailtoUrl: string;
  smsContent: string;
}

export function formatDeliveryAlertMessage(order: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliverySlot?: string;
  items: Array<{
    productName: string;
    productUnit?: string;
    quantity: number;
    priceAtPurchase: number;
    itemTotal: number;
  }>;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
}): string {
  const itemsText = (order.items || [])
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.productName} (${item.quantity} x ₹${item.priceAtPurchase} = ₹${item.itemTotal})`
    )
    .join('\n');

  return `🌾 *FARM TO HOME — NEW ORDER & DELIVERY DISPATCH ALERT* 🌾
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Order No: ${order.orderNumber}
💰 Total Amount: ₹${order.totalAmount} (${order.paymentMethod || 'UPI'} - ${order.paymentStatus || 'PAID'})
⏰ Delivery Slot: ${order.deliverySlot || 'Morning Farm Delivery (7 AM - 11 AM)'}

👤 *CUSTOMER & DELIVERY INFO:*
• Name: ${order.customerName}
• Phone: ${order.customerPhone}
• Address: ${order.deliveryAddress}

🛒 *ORDERED FARM ITEMS:*
${itemsText}

💵 Subtotal: ₹${order.subtotal} | Delivery: ₹${order.shippingFee}
💳 Grand Total: ₹${order.totalAmount}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ Auto-Dispatched to Platform Owner:
👤 Owner: Nagulakunta Srimanth
📞 Phone / WhatsApp: +91 ${OWNER_PHONE}
📧 Email: ${OWNER_EMAIL}`;
}

export async function dispatchOrderDeliveryNotification(order: {
  orderNumber: string;
  orderId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliverySlot?: string;
  items: Array<{
    productName: string;
    productUnit?: string;
    quantity: number;
    priceAtPurchase: number;
    itemTotal: number;
  }>;
  subtotal: number;
  shippingFee: number;
  discountAmount?: number;
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
}): Promise<DeliveryAlertPayload> {
  const textMessage = formatDeliveryAlertMessage(order);

  const whatsappUrl = `https://api.whatsapp.com/send?phone=91${OWNER_PHONE}&text=${encodeURIComponent(textMessage)}`;
  const mailtoUrl = `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(
    `🌾 [F2H DELIVERY DISPATCH] Order ${order.orderNumber} - ₹${order.totalAmount}`
  )}&body=${encodeURIComponent(textMessage)}`;

  const alertPayload: DeliveryAlertPayload = {
    orderNumber: order.orderNumber,
    orderId: order.orderId,
    timestamp: new Date().toISOString(),
    ownerEmail: OWNER_EMAIL,
    ownerPhone: OWNER_PHONE,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    deliveryAddress: order.deliveryAddress,
    deliverySlot: order.deliverySlot || 'Morning Farm Delivery (7 AM - 11 AM)',
    items: order.items || [],
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    discountAmount: order.discountAmount || 0,
    totalAmount: order.totalAmount,
    paymentMethod: order.paymentMethod || 'UPI',
    paymentStatus: order.paymentStatus || 'PAID',
    status: 'TRANSMITTED_TO_OWNER',
    whatsappUrl,
    mailtoUrl,
    smsContent: textMessage,
  };

  // 1. Save to local JSON audit log
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    let existing: DeliveryAlertPayload[] = [];
    if (fs.existsSync(OWNER_ALERTS_FILE)) {
      try {
        existing = JSON.parse(fs.readFileSync(OWNER_ALERTS_FILE, 'utf-8'));
      } catch {}
    }
    existing = [alertPayload, ...existing.filter((a) => a.orderNumber !== alertPayload.orderNumber)];
    fs.writeFileSync(OWNER_ALERTS_FILE, JSON.stringify(existing, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Notice saving owner alert backup:', err);
  }

  // 2. Keep in memory for instant serverless execution
  const g = globalThis as unknown as { __f2h_owner_alerts?: DeliveryAlertPayload[] };
  if (!g.__f2h_owner_alerts) g.__f2h_owner_alerts = [];
  g.__f2h_owner_alerts = [
    alertPayload,
    ...g.__f2h_owner_alerts.filter((a) => a.orderNumber !== alertPayload.orderNumber),
  ];

  // 3. Attempt live email transmission if RESEND_API_KEY is configured
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'orders@farmtohome.in',
          to: OWNER_EMAIL,
          subject: `🌾 [F2H DELIVERY DISPATCH] New Order ${order.orderNumber} (₹${order.totalAmount})`,
          text: textMessage,
        }),
      });
      console.log(`[EMAIL DISPATCH] Sent live order email to ${OWNER_EMAIL}`);
    } catch (emailErr) {
      console.warn('Resend email dispatch notice:', emailErr);
    }
  }

  // 4. AUTOMATED DIRECT WHATSAPP DISPATCH TO OWNER (Nagulakunta Srimanth: 9347405899)
  // Sends WhatsApp notification directly to owner without requiring customer click
  try {
    const waResult = await sendDirectWhatsAppToOwner({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      deliveryAddress: order.deliveryAddress,
      deliverySlot: order.deliverySlot,
      items: order.items || [],
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      discountAmount: order.discountAmount,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
    });
    console.log(`[AUTO WHATSAPP DISPATCH RESULT]:`, waResult);
  } catch (waErr) {
    console.warn('Auto WhatsApp dispatch background error:', waErr);
  }

  // 5. Log alert to system console
  console.log(`\n======================================================`);
  console.log(`📢 [OWNER DELIVERY ALERT DISPATCHED]`);
  console.log(`Destination Phone / WhatsApp: +91 ${OWNER_PHONE}`);
  console.log(`Destination Email: ${OWNER_EMAIL}`);
  console.log(`Order: ${order.orderNumber} | Customer: ${order.customerName} (${order.customerPhone})`);
  console.log(`Delivery Address: ${order.deliveryAddress}`);
  console.log(`Total: ₹${order.totalAmount}`);
  console.log(`======================================================\n`);

  return alertPayload;
}

