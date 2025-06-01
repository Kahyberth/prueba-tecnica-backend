import { BadRequestException } from '@nestjs/common';
import { validateMerchantId, validateMunicipio } from '../merchant.validators';

describe('MerchantValidators', () => {
  describe('validateMunicipio', () => {
    describe('Valid municipalities', () => {
      it('should return true for valid municipality - Medellín', () => {
        const result = validateMunicipio('Medellín');
        expect(result).toBe(true);
      });

      it('should return true for valid municipality - Barranquilla', () => {
        const result = validateMunicipio('Barranquilla');
        expect(result).toBe(true);
      });

      it('should return true for valid municipality - Cali', () => {
        const result = validateMunicipio('Cali');
        expect(result).toBe(true);
      });

      it('should return true for valid municipality - Bucaramanga', () => {
        const result = validateMunicipio('Bucaramanga');
        expect(result).toBe(true);
      });

      it('should return true for valid municipality - Ibagué', () => {
        const result = validateMunicipio('Ibagué');
        expect(result).toBe(true);
      });
    });

    describe('Case insensitive validation', () => {
      it('should return true for municipality in lowercase - medellín', () => {
        const result = validateMunicipio('medellín');
        expect(result).toBe(true);
      });

      it('should return true for municipality in uppercase - CALI', () => {
        const result = validateMunicipio('CALI');
        expect(result).toBe(true);
      });

      it('should return true for municipality in mixed case - BuCaRaMaNgA', () => {
        const result = validateMunicipio('BuCaRaMaNgA');
        expect(result).toBe(true);
      });

      it('should return true for municipality with accent in different case - ibagué', () => {
        const result = validateMunicipio('ibagué');
        expect(result).toBe(true);
      });
    });

    describe('Invalid municipalities', () => {
      it('should return false for non-existent municipality - Bogotá', () => {
        const result = validateMunicipio('Bogotá');
        expect(result).toBe(false);
      });

      it('should return false for completely invalid municipality - Madrid', () => {
        const result = validateMunicipio('Madrid');
        expect(result).toBe(false);
      });

      it('should return false for empty string', () => {
        const result = validateMunicipio('');
        expect(result).toBe(false);
      });

      it('should return false for municipality with extra spaces - " Medellín "', () => {
        const result = validateMunicipio(' Medellín ');
        expect(result).toBe(false);
      });

      it('should return false for municipality with typo - Medellin (missing accent)', () => {
        const result = validateMunicipio('Medellin');
        expect(result).toBe(false);
      });

      it('should return false for municipality with numbers - Cali123', () => {
        const result = validateMunicipio('Cali123');
        expect(result).toBe(false);
      });

      it('should return false for null value', () => {
        const result = validateMunicipio(null as any);
        expect(result).toBe(false);
      });

      it('should return false for undefined value', () => {
        const result = validateMunicipio(undefined as any);
        expect(result).toBe(false);
      });
    });

    describe('Special characters and edge cases', () => {
      it('should return false for municipality with special characters - Cali@', () => {
        const result = validateMunicipio('Cali@');
        expect(result).toBe(false);
      });

      it('should return false for municipality with hyphens but wrong format', () => {
        const result = validateMunicipio('El-Carmen-de-Bolívar');
        expect(result).toBe(false);
      });

      it('should return true for municipality with correct spaces - El Carmen de Bolívar', () => {
        const result = validateMunicipio('El Carmen de Bolívar');
        expect(result).toBe(true);
      });

      it('should return true for municipality with apostrophe - Villa del Rosario', () => {
        const result = validateMunicipio('Villa del Rosario');
        expect(result).toBe(true);
      });
    });
  });

  describe('validateMerchantId', () => {
    describe('Valid merchant IDs', () => {
      it('should not throw for valid positive integer - 1', () => {
        expect(() => validateMerchantId(1)).not.toThrow();
      });

      it('should not throw for valid positive integer - 100', () => {
        expect(() => validateMerchantId(100)).not.toThrow();
      });

      it('should not throw for valid positive integer - 999999', () => {
        expect(() => validateMerchantId(999999)).not.toThrow();
      });

      it('should not throw for large valid integer', () => {
        expect(() => validateMerchantId(2147483647)).not.toThrow();
      });
    });

    describe('Invalid merchant IDs - should throw BadRequestException', () => {
      it('should throw for zero', () => {
        expect(() => validateMerchantId(0)).toThrow(BadRequestException);
        expect(() => validateMerchantId(0)).toThrow(
          'El ID del comerciante debe ser un número entero positivo',
        );
      });

      it('should throw for negative number', () => {
        expect(() => validateMerchantId(-1)).toThrow(BadRequestException);
        expect(() => validateMerchantId(-1)).toThrow(
          'El ID del comerciante debe ser un número entero positivo',
        );
      });

      it('should throw for negative large number', () => {
        expect(() => validateMerchantId(-100)).toThrow(BadRequestException);
      });

      it('should throw for decimal number', () => {
        expect(() => validateMerchantId(1.5)).toThrow(BadRequestException);
      });

      it('should throw for very small decimal', () => {
        expect(() => validateMerchantId(1.00001)).toThrow(BadRequestException);
      });

      it('should throw for null', () => {
        expect(() => validateMerchantId(null as any)).toThrow(
          BadRequestException,
        );
      });

      it('should throw for undefined', () => {
        expect(() => validateMerchantId(undefined as any)).toThrow(
          BadRequestException,
        );
      });

      it('should throw for NaN', () => {
        expect(() => validateMerchantId(NaN)).toThrow(BadRequestException);
      });

      it('should throw for Infinity', () => {
        expect(() => validateMerchantId(Infinity)).toThrow(BadRequestException);
      });

      it('should throw for negative Infinity', () => {
        expect(() => validateMerchantId(-Infinity)).toThrow(
          BadRequestException,
        );
      });

      it('should throw for string number', () => {
        expect(() => validateMerchantId('123' as any)).toThrow(
          BadRequestException,
        );
      });

      it('should throw for empty string', () => {
        expect(() => validateMerchantId('' as any)).toThrow(
          BadRequestException,
        );
      });

      it('should throw for object', () => {
        expect(() => validateMerchantId({} as any)).toThrow(
          BadRequestException,
        );
      });

      it('should throw for array', () => {
        expect(() => validateMerchantId([] as any)).toThrow(
          BadRequestException,
        );
      });
    });

    describe('Error message validation', () => {
      it('should throw BadRequestException with correct message for zero', () => {
        try {
          validateMerchantId(0);
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestException);
          expect(error.message).toBe(
            'El ID del comerciante debe ser un número entero positivo',
          );
        }
      });

      it('should throw BadRequestException with correct message for negative number', () => {
        try {
          validateMerchantId(-5);
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestException);
          expect(error.message).toBe(
            'El ID del comerciante debe ser un número entero positivo',
          );
        }
      });

      it('should throw BadRequestException with correct message for decimal', () => {
        try {
          validateMerchantId(1.5);
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestException);
          expect(error.message).toBe(
            'El ID del comerciante debe ser un número entero positivo',
          );
        }
      });
    });
  });
});
