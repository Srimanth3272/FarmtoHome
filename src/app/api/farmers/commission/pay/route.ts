import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { farmerId, amount, transactionUtr, paymentMethod = 'UPI', notes } = body;

    if (!farmerId || !amount) {
      return NextResponse.json(
        { error: 'Farmer ID and payment amount are required.' },
        { status: 400 }
      );
    }

    const payAmount = parseFloat(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payment amount. Must be greater than ₹0.' },
        { status: 400 }
      );
    }

    // Find farmer profile
    let farmer = await prisma.farmerProfile.findFirst({
      where: {
        OR: [{ id: farmerId }, { userId: farmerId }],
      },
    });

    if (!farmer) {
      farmer = await prisma.farmerProfile.findFirst();
    }

    if (!farmer) {
      return NextResponse.json({ error: 'Farmer profile not found.' }, { status: 404 });
    }

    // Generate reference UTR if not supplied
    const utr = transactionUtr?.trim() || `UPI${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 9000 + 1000)}`;

    // Create CommissionPayment record
    const payment = await prisma.commissionPayment.create({
      data: {
        farmerId: farmer.id,
        amount: payAmount,
        paymentMethod,
        transactionUtr: utr,
        status: 'COMPLETED',
        notes: notes || `5% Platform Facilitation Commission paid via ${paymentMethod}`,
      },
    });

    // Update FarmerProfile ledger
    const updatedFarmer = await prisma.farmerProfile.update({
      where: { id: farmer.id },
      data: {
        totalCommissionPaid: {
          increment: payAmount,
        },
        totalCommissionDue: Math.max(0, (farmer.totalCommissionDue || 0) - payAmount),
      },
      include: {
        commissionPayments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Commission payment of ₹${payAmount.toLocaleString()} received via UPI! Platform ledger updated.`,
      payment,
      farmer: updatedFarmer,
    });
  } catch (error) {
    console.error('Error processing commission payment:', error);
    return NextResponse.json(
      { error: 'Failed to record commission payment.' },
      { status: 500 }
    );
  }
}
