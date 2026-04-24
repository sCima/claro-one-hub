import { useClaroContext } from '../context/ClaroContext';

export function useClaroData() {
  const ctx = useClaroContext();

  const totalMonthlyAmount = ctx.services.reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const pendingInvoice = ctx.invoices.find((inv) => inv.status === 'pending') ?? null;
  const mobileService = ctx.services.find((s) => s.type === 'mobile') ?? null;

  return { ...ctx, totalMonthlyAmount, pendingInvoice, mobileService };
}
