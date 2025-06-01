import { calculateMerchantTotals, INITIAL_TOTALS } from '../merchant.totals';

describe('MerchantTotals', () => {
  describe('INITIAL_TOTALS constant', () => {
    it('should have correct initial values', () => {
      expect(INITIAL_TOTALS).toEqual({
        totalIngresos: 0,
        totalEmpleados: 0,
      });
    });

    it('should be immutable object structure', () => {
      expect(typeof INITIAL_TOTALS.totalIngresos).toBe('number');
      expect(typeof INITIAL_TOTALS.totalEmpleados).toBe('number');
    });
  });

  describe('calculateMerchantTotals', () => {
    describe('Valid calculations', () => {
      it('should calculate totals for single establishment', () => {
        const establecimientos = [{ ingresos: 1000000, numeroEmpleados: 5 }];

        const result = calculateMerchantTotals(establecimientos);

        expect(result).toEqual({
          totalIngresos: 1000000,
          totalEmpleados: 5,
        });
      });

      it('should calculate totals for multiple establishments', () => {
        const establecimientos = [
          { ingresos: 1000000, numeroEmpleados: 5 },
          { ingresos: 2500000, numeroEmpleados: 8 },
          { ingresos: 800000, numeroEmpleados: 3 },
        ];

        const result = calculateMerchantTotals(establecimientos);

        expect(result).toEqual({
          totalIngresos: 4300000,
          totalEmpleados: 16,
        });
      });

      it('should handle establishments with zero values', () => {
        const establecimientos = [
          { ingresos: 0, numeroEmpleados: 0 },
          { ingresos: 1000000, numeroEmpleados: 5 },
        ];

        const result = calculateMerchantTotals(establecimientos);

        expect(result).toEqual({
          totalIngresos: 1000000,
          totalEmpleados: 5,
        });
      });

      it('should handle large numbers correctly', () => {
        const establecimientos = [
          { ingresos: 999999999, numeroEmpleados: 100 },
          { ingresos: 1000000001, numeroEmpleados: 150 },
        ];

        const result = calculateMerchantTotals(establecimientos);

        expect(result).toEqual({
          totalIngresos: 2000000000,
          totalEmpleados: 250,
        });
      });

      it('should handle decimal values correctly', () => {
        const establecimientos = [
          { ingresos: 1000000.5, numeroEmpleados: 5 },
          { ingresos: 2500000.75, numeroEmpleados: 8 },
        ];

        const result = calculateMerchantTotals(establecimientos);

        expect(result).toEqual({
          totalIngresos: 3500001.25,
          totalEmpleados: 13,
        });
      });
    });

    describe('Empty or null inputs', () => {
      it('should return INITIAL_TOTALS for empty array', () => {
        const establecimientos: Array<{
          ingresos: number;
          numeroEmpleados: number;
        }> = [];

        const result = calculateMerchantTotals(establecimientos);

        expect(result).toEqual(INITIAL_TOTALS);
        expect(result).toEqual({
          totalIngresos: 0,
          totalEmpleados: 0,
        });
      });

      it('should return INITIAL_TOTALS for null input', () => {
        const result = calculateMerchantTotals(null as any);

        expect(result).toEqual(INITIAL_TOTALS);
      });

      it('should return INITIAL_TOTALS for undefined input', () => {
        const result = calculateMerchantTotals(undefined as any);

        expect(result).toEqual(INITIAL_TOTALS);
      });
    });

    describe('Handling null/undefined values in establishments', () => {
      it('should treat null ingresos as 0', () => {
        const establecimientos = [
          { ingresos: null as any, numeroEmpleados: 5 },
          { ingresos: 1000000, numeroEmpleados: 3 },
        ];

        const result = calculateMerchantTotals(establecimientos);

        expect(result).toEqual({
          totalIngresos: 1000000,
          totalEmpleados: 8,
        });
      });

      it('should treat undefined ingresos as 0', () => {
        const establecimientos = [
          { ingresos: undefined as any, numeroEmpleados: 5 },
          { ingresos: 2000000, numeroEmpleados: 7 },
        ];

        const result = calculateMerchantTotals(establecimientos);

        expect(result).toEqual({
          totalIngresos: 2000000,
          totalEmpleados: 12,
        });
      });

      it('should treat null numeroEmpleados as 0', () => {
        const establecimientos = [
          { ingresos: 1500000, numeroEmpleados: null as any },
          { ingresos: 800000, numeroEmpleados: 4 },
        ];

        const result = calculateMerchantTotals(establecimientos);

        expect(result).toEqual({
          totalIngresos: 2300000,
          totalEmpleados: 4,
        });
      });

      it('should treat undefined numeroEmpleados as 0', () => {
        const establecimientos = [
          { ingresos: 1200000, numeroEmpleados: undefined as any },
          { ingresos: 900000, numeroEmpleados: 6 },
        ];

        const result = calculateMerchantTotals(establecimientos);

        expect(result).toEqual({
          totalIngresos: 2100000,
          totalEmpleados: 6,
        });
      });

      it('should handle establishment with all null/undefined values', () => {
        const establecimientos = [
          { ingresos: null as any, numeroEmpleados: undefined as any },
          { ingresos: 1000000, numeroEmpleados: 5 },
        ];

        const result = calculateMerchantTotals(establecimientos);

        expect(result).toEqual({
          totalIngresos: 1000000,
          totalEmpleados: 5,
        });
      });
    });

    describe('Edge cases and special values', () => {
      it('should handle negative values (though business logic might prevent this)', () => {
        const establecimientos = [
          { ingresos: -500000, numeroEmpleados: 5 },
          { ingresos: 1500000, numeroEmpleados: 8 },
        ];

        const result = calculateMerchantTotals(establecimientos);

        expect(result).toEqual({
          totalIngresos: 1000000,
          totalEmpleados: 13,
        });
      });

      it('should handle establishments with extra properties', () => {
        const establecimientos = [
          {
            ingresos: 1000000,
            numeroEmpleados: 5,
            extraProperty: 'should be ignored' as any,
          },
          {
            ingresos: 800000,
            numeroEmpleados: 3,
            anotherExtra: 123 as any,
          },
        ];

        const result = calculateMerchantTotals(establecimientos);

        expect(result).toEqual({
          totalIngresos: 1800000,
          totalEmpleados: 8,
        });
      });

      it('should handle very small decimal values', () => {
        const establecimientos = [
          { ingresos: 0.01, numeroEmpleados: 1 },
          { ingresos: 0.99, numeroEmpleados: 2 },
        ];

        const result = calculateMerchantTotals(establecimientos);

        expect(result).toEqual({
          totalIngresos: 1.0,
          totalEmpleados: 3,
        });
      });

      it('should handle mixed valid and invalid establishments', () => {
        const establecimientos = [
          { ingresos: 1000000, numeroEmpleados: 5 },
          { ingresos: NaN, numeroEmpleados: 3 },
          { ingresos: 800000, numeroEmpleados: 4 },
        ];

        const result = calculateMerchantTotals(establecimientos);

        expect(result.totalIngresos).toBe(1800000);
        expect(result.totalEmpleados).toBe(12);
      });

      it('should handle Infinity values', () => {
        const establecimientos = [
          { ingresos: Infinity, numeroEmpleados: 5 },
          { ingresos: 1000000, numeroEmpleados: 3 },
        ];

        const result = calculateMerchantTotals(establecimientos);

        expect(result.totalIngresos).toBe(Infinity);
        expect(result.totalEmpleados).toBe(8);
      });
    });

    describe('Return value immutability', () => {
      it('should return a new object, not modify INITIAL_TOTALS', () => {
        const establecimientos = [{ ingresos: 1000000, numeroEmpleados: 5 }];

        const result = calculateMerchantTotals(establecimientos);

        expect(INITIAL_TOTALS).toEqual({
          totalIngresos: 0,
          totalEmpleados: 0,
        });

        expect(result).not.toBe(INITIAL_TOTALS);
        expect(result).toEqual({
          totalIngresos: 1000000,
          totalEmpleados: 5,
        });
      });

      it('should return INITIAL_TOTALS reference for empty arrays (optimization check)', () => {
        const result = calculateMerchantTotals([]);

        expect(result).toBe(INITIAL_TOTALS);
      });
    });

    describe('Real-world scenarios', () => {
      it('should handle typical restaurant chain scenario', () => {
        const establecimientos = [
          { ingresos: 15000000, numeroEmpleados: 25 },
          { ingresos: 8000000, numeroEmpleados: 15 },
          { ingresos: 12000000, numeroEmpleados: 20 },
          { ingresos: 5000000, numeroEmpleados: 10 },
        ];

        const result = calculateMerchantTotals(establecimientos);

        expect(result).toEqual({
          totalIngresos: 40000000,
          totalEmpleados: 70,
        });
      });

      it('should handle single small business', () => {
        const establecimientos = [{ ingresos: 500000, numeroEmpleados: 2 }];

        const result = calculateMerchantTotals(establecimientos);

        expect(result).toEqual({
          totalIngresos: 500000,
          totalEmpleados: 2,
        });
      });

      it('should handle business with seasonal locations', () => {
        const establecimientos = [
          { ingresos: 10000000, numeroEmpleados: 15 },
          { ingresos: 0, numeroEmpleados: 0 },
          { ingresos: 3000000, numeroEmpleados: 5 },
        ];

        const result = calculateMerchantTotals(establecimientos);

        expect(result).toEqual({
          totalIngresos: 13000000,
          totalEmpleados: 20,
        });
      });
    });
  });
});
