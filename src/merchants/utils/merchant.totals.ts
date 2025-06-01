export interface MerchantTotals {
  totalIngresos: number;
  totalEmpleados: number;
}

export const INITIAL_TOTALS: MerchantTotals = {
  totalIngresos: 0,
  totalEmpleados: 0,
};

export const calculateMerchantTotals = (
  establecimientos: Array<{ ingresos: number; numeroEmpleados: number }>,
): MerchantTotals => {
  if (!establecimientos || establecimientos.length === 0) {
    return INITIAL_TOTALS;
  }

  return establecimientos.reduce(
    (totals, establecimiento) => ({
      totalIngresos: totals.totalIngresos + (establecimiento.ingresos || 0),
      totalEmpleados:
        totals.totalEmpleados + (establecimiento.numeroEmpleados || 0),
    }),
    INITIAL_TOTALS,
  );
};
