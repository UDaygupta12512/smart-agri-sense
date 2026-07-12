import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, rate, tenure } = body;

    const validAmount = Math.max(10000, Math.min(500000, Number(amount) || 0));
    const validRate = Math.max(0, Math.min(30, Number(rate) || 0));
    const validTenure = Math.max(1, Math.min(60, Number(tenure) || 0));

    const r = validRate / 12 / 100;
    const n = validTenure;

    let emi = 0;
    let totalInterest = 0;

    if (r === 0 || !Number.isFinite(r)) {
      const monthlyPayment = validAmount / n;
      emi = Number.isFinite(monthlyPayment) ? Math.round(monthlyPayment) : 0;
      totalInterest = 0;
    } else {
      const powerTerm = Math.pow(1 + r, n);
      if (Number.isFinite(powerTerm) && powerTerm !== 1) {
        const calculatedEmi = (validAmount * r * powerTerm) / (powerTerm - 1);
        if (Number.isFinite(calculatedEmi)) {
          emi = Math.round(calculatedEmi);
          const totalPayment = calculatedEmi * n;
          totalInterest = Math.max(0, Math.round(totalPayment - validAmount));
        }
      }
    }

    return NextResponse.json({
      emi,
      totalInterest,
      totalPayment: validAmount + totalInterest,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate EMI' }, { status: 400 });
  }
}
