import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export const YYYY_MM_DD_FORMAT = 'YYYY-MM-DD';
const DATE_FORMAT_HINT = 'YYYY-MM-DD (e.g. 2026-01-31)';

/**
 * Normaliza un string a fecha ISO al inicio del día (UTC midnight), o un
 * YYYY-MM-DD puro. Si el formato es inválido class-validator lo rechaza
 * antes de llegar al servicio. Acepta también ISO-8601 completos.
 */
const toIsoDateOrNull = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString().split('T')[0];
};

export class GetDailyReportDto {
  @IsOptional()
  @IsString()
  @IsDateString({ strict: false }, { message: `date debe ser ${DATE_FORMAT_HINT}` })
  @Transform(toIsoDateOrNull)
  date?: string;
}

export class GetPeriodReportDto {
  @IsDateString(
    { strict: false },
    { message: `startDate debe ser ${DATE_FORMAT_HINT}` },
  )
  @Transform(toIsoDateOrNull)
  startDate!: string;

  @IsDateString(
    { strict: false },
    { message: `endDate debe ser ${DATE_FORMAT_HINT}` },
  )
  @Transform(toIsoDateOrNull)
  endDate!: string;
}

export class GetCurrencyReportDto {
  @IsOptional()
  @IsDateString(
    { strict: false },
    { message: `startDate debe ser ${DATE_FORMAT_HINT}` },
  )
  @Transform(toIsoDateOrNull)
  startDate?: string;

  @IsOptional()
  @IsDateString(
    { strict: false },
    { message: `endDate debe ser ${DATE_FORMAT_HINT}` },
  )
  @Transform(toIsoDateOrNull)
  endDate?: string;
}

export class GetExpensesReportDto {
  @IsOptional()
  @IsDateString(
    { strict: false },
    { message: `startDate debe ser ${DATE_FORMAT_HINT}` },
  )
  @Transform(toIsoDateOrNull)
  startDate?: string;

  @IsOptional()
  @IsDateString(
    { strict: false },
    { message: `endDate debe ser ${DATE_FORMAT_HINT}` },
  )
  @Transform(toIsoDateOrNull)
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;
}

export class GetProfitReportDto extends GetPeriodReportDto {}

export class GetCashFlowReportDto extends GetPeriodReportDto {}

export class GetFxPerformanceReportDto extends GetPeriodReportDto {
  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;
}

export class GetAuditSummaryDto {
  @IsOptional()
  @IsDateString(
    { strict: false },
    { message: `startDate debe ser ${DATE_FORMAT_HINT}` },
  )
  @Transform(toIsoDateOrNull)
  startDate?: string;

  @IsOptional()
  @IsDateString(
    { strict: false },
    { message: `endDate debe ser ${DATE_FORMAT_HINT}` },
  )
  @Transform(toIsoDateOrNull)
  endDate?: string;
}

export class GetCurrencyReportByIdParamDto {
  @IsInt()
  @Min(1)
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() !== ''
      ? Number(value)
      : value,
  )
  id!: number;
}
