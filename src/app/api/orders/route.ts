import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const orderNumber = searchParams.get('orderNumber');

    if (orderNumber) {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });
      return NextResponse.json(order);
    }

    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      items,
      subtotal,
      shippingFee,
      discountAmount,
      totalAmount,
      couponCode,
      paymentMethod,
      deliveryAddress,
      deliverySlot,
    } = body;

    // Verify default customer if not provided
    let customerId = userId;
    if (!customerId || customerId.startsWith('demo-')) {
      const demoUser = await prisma.user.findFirst({
        where: { role: 'CUSTOMER' },
      });
      customerId = demoUser ? demoUser.id : (await prisma.user.findFirst())?.id;
    }

    const orderNumber = `F2H-ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: customerId,
        status: 'CONFIRMED',
        subtotal: parseFloat(subtotal) || 0,
        shippingFee: parseFloat(shippingFee) || 0,
        discountAmount: parseFloat(discountAmount) || 0,
        totalAmount: parseFloat(totalAmount) || 0,
        couponCode: couponCode || null,
        paymentMethod: paymentMethod || 'UPI',
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        deliverySlot: deliverySlot || 'Morning Farm Delivery (7 AM - 11 AM)',
        estimatedDelivery: 'Tomorrow Morning',
        deliveryAddress: typeof deliveryAddress === 'string' ? deliveryAddress : JSON.stringify(deliveryAddress),
        items: {
          create: items.map((item: any) => ({
            productId: item.productId || item.product?.id,
            farmerId: item.product?.farmerId || 'demo-farmer-id',
            productName: item.product?.name || 'Farm Product',
            productUnit: item.product?.unit || '1 kg',
            priceAtPurchase: item.product?.price || 0,
            quantity: item.quantity || 1,
            itemTotal: (item.product?.price || 0) * (item.quantity || 1),
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
