import { NextResponse } from 'next/server';
import {
  getWhatsAppConfig,
  saveWhatsAppConfig,
  sendTestWhatsAppMessage,
  sendDirectWhatsAppToOwner,
  OWNER_PHONE,
  OWNER_NAME,
} from '@/lib/whatsapp-service';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = getWhatsAppConfig();

    return NextResponse.json({
      success: true,
      ownerPhone: config.ownerPhone || OWNER_PHONE,
      ownerName: OWNER_NAME,
      provider: config.provider,
      hasCallmebotKey: Boolean(config.callmebotApiKey),
      callmebotApiKeyMasked: config.callmebotApiKey
        ? `${config.callmebotApiKey.slice(0, 3)}****${config.callmebotApiKey.slice(-2)}`
        : '',
      hasTwilio: Boolean(config.twilioAccountSid && config.twilioAuthToken),
      hasMeta: Boolean(config.metaApiToken && config.metaPhoneNumberId),
      hasWebhook: Boolean(config.webhookUrl),
      webhookUrl: config.webhookUrl || '',
      isAutoSendEnabled: config.isAutoSendEnabled,
      lastDispatchResult: config.lastDispatchResult || null,
    });
  } catch (error: any) {
    console.error('Error fetching WhatsApp notification config:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch WhatsApp config' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. Send live test message to owner's WhatsApp (+91 9347405899)
    if (action === 'test') {
      const testResult = await sendTestWhatsAppMessage(body.customNote);
      return NextResponse.json({
        success: testResult.success,
        result: testResult,
        targetPhone: `+91 ${OWNER_PHONE}`,
        message: testResult.message,
      });
    }

    // 2. Save settings
    if (action === 'save') {
      const {
        callmebotApiKey,
        twilioAccountSid,
        twilioAuthToken,
        twilioFromNumber,
        metaApiToken,
        metaPhoneNumberId,
        webhookUrl,
        provider,
        isAutoSendEnabled,
      } = body;

      const updated = saveWhatsAppConfig({
        provider: provider || 'callmebot',
        callmebotApiKey: callmebotApiKey !== undefined ? callmebotApiKey.trim() : undefined,
        twilioAccountSid: twilioAccountSid !== undefined ? twilioAccountSid.trim() : undefined,
        twilioAuthToken: twilioAuthToken !== undefined ? twilioAuthToken.trim() : undefined,
        twilioFromNumber: twilioFromNumber !== undefined ? twilioFromNumber.trim() : undefined,
        metaApiToken: metaApiToken !== undefined ? metaApiToken.trim() : undefined,
        metaPhoneNumberId: metaPhoneNumberId !== undefined ? metaPhoneNumberId.trim() : undefined,
        webhookUrl: webhookUrl !== undefined ? webhookUrl.trim() : undefined,
        isAutoSendEnabled: isAutoSendEnabled !== false,
      });

      return NextResponse.json({
        success: true,
        message: 'WhatsApp notification configuration saved successfully!',
        config: {
          provider: updated.provider,
          hasCallmebotKey: Boolean(updated.callmebotApiKey),
          isAutoSendEnabled: updated.isAutoSendEnabled,
        },
      });
    }

    // 3. Dispatch specific order by orderNumber or direct payload
    if (action === 'dispatch') {
      let order = body.order;
      if (!order && body.orderNumber) {
        order = await prisma.order.findUnique({
          where: { orderNumber: body.orderNumber },
          include: { items: true },
        }).catch(() => null);

        if (!order) {
          const ordersFile = path.join(process.cwd(), 'data', 'orders.json');
          if (fs.existsSync(ordersFile)) {
            try {
              const list = JSON.parse(fs.readFileSync(ordersFile, 'utf-8'));
              order = list.find((o: any) => o.orderNumber === body.orderNumber);
            } catch {}
          }
        }
      }

      if (!order) {
        return NextResponse.json({ error: 'Order not found for dispatch' }, { status: 404 });
      }

      let parsedAddr: any = {};
      try {
        parsedAddr = typeof order.deliveryAddress === 'string' ? JSON.parse(order.deliveryAddress) : (order.deliveryAddress || {});
      } catch {
        parsedAddr = { fullName: 'Valued Customer', addressLine1: String(order.deliveryAddress || '') };
      }

      const fullAddressText = `${parsedAddr.addressLine1 || ''}, ${parsedAddr.addressLine2 || ''}, ${parsedAddr.city || ''}, ${parsedAddr.state || ''} - ${parsedAddr.pincode || ''}`;

      const dispatchResult = await sendDirectWhatsAppToOwner({
        orderNumber: order.orderNumber,
        customerName: order.customerName || parsedAddr.fullName || 'Valued Customer',
        customerPhone: order.customerPhone || parsedAddr.phone || OWNER_PHONE,
        deliveryAddress: fullAddressText,
        deliverySlot: order.deliverySlot,
        items: order.items || [],
        subtotal: order.subtotal || 0,
        shippingFee: order.shippingFee || 0,
        discountAmount: order.discountAmount || 0,
        totalAmount: order.totalAmount || 0,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
      });

      return NextResponse.json({
        success: dispatchResult.success,
        result: dispatchResult,
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in POST /api/notifications/whatsapp:', error);
    return NextResponse.json(
      { error: error?.message || 'WhatsApp notification request failed' },
      { status: 500 }
    );
  }
}
