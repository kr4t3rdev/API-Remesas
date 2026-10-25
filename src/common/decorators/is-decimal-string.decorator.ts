import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { Decimal } from '@prisma/client/runtime/library';

export interface DecimalStringOptions extends ValidationOptions {
  /** Límite inferior inclusivo, expresado como decimal string ("0"). */
  min?: string;
  /** Límite superior inclusivo, expresado como decimal string ("1"). */
  max?: string;
  /** Máximo de decimales admitidos (equivale a `@IsNumber({ maxDecimalPlaces })`). */
  maxDecimalPlaces?: number;
}

/**
 * Valida magnitudes monetarias que cruzan el contrato como **decimal-string**.
 *
 * Decisión 1.14 del change `native-clients-openapi`: todo valor monetario o
 * de tasa entra y sale de la API como string decimal ("265.09"), nunca como
 * número JSON, para no pasar por floats binarios en ningún cliente.
 *
 * Acepta: "0", "265.09", "0.05". Rechaza: "", "abc", "-1", "1,5", "1e3", 265.09 (número).
 */
export function IsDecimalString(options: DecimalStringOptions = {}) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isDecimalString',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') return false;
          const normalized = value.trim();
          if (!/^\d+(\.\d+)?$/.test(normalized)) return false;

          if (options.maxDecimalPlaces !== undefined) {
            const decimals = normalized.split('.')[1]?.length ?? 0;
            if (decimals > options.maxDecimalPlaces) return false;
          }

          // El rango se evalúa con Decimal: la validación también es
          // financiera y no debe depender de la precisión de IEEE-754.
          const decimal = new Decimal(normalized);
          if (!decimal.isFinite()) return false;
          if (options.min !== undefined && decimal.lessThan(new Decimal(options.min))) return false;
          if (options.max !== undefined && decimal.greaterThan(new Decimal(options.max))) return false;
          return true;
        },
        defaultMessage(args: ValidationArguments): string {
          // Un mensaje explícito del DTO tiene prioridad (mensajes de negocio).
          if (typeof options.message === 'string') return options.message;
          if (typeof options.message === 'function') return options.message(args);

          const property = args.property;
          if (options.min !== undefined && options.max !== undefined) {
            return `${property} debe ser un decimal string entre ${options.min} y ${options.max}`;
          }
          if (options.min !== undefined) {
            return `${property} debe ser un decimal string mayor o igual a ${options.min}`;
          }
          if (options.max !== undefined) {
            return `${property} debe ser un decimal string menor o igual a ${options.max}`;
          }
          return `${property} debe ser un decimal string (ej. "265.09")`;
        },
      },
    });
  };
}
