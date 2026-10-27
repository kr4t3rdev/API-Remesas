import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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
  @ApiProperty({
    type: String,
    required: false,
    example: '2026-01-31',
    description: 'Fecha del reporte (YYYY-MM-DD). Por defecto: hoy.',
  })
  @IsOptional()
  @IsString()
  @IsDateString({ strict: false }, { message: `date debe ser ${DATE_FORMAT_HINT}` })
  @Transform(toIsoDateOrNull)
  date?: string;
}

export class GetPeriodReportDto {
  @ApiProperty({
    type: String,
    example: '2026-01-01',
    description: 'Fecha inicial del período (YYYY-MM-DD)',
  })
  @IsDateString(
    { strict: false },
    { message: `startDate debe ser ${DATE_FORMAT_HINT}` },
  )
  @Transform(toIsoDateOrNull)
  startDate!: string;

  @ApiProperty({
    type: String,
    example: '2026-12-31',
    description: 'Fecha final del período (YYYY-MM-DD)',
  })
  @IsDateString(
    { strict: false },
    { message: `endDate debe ser ${DATE_FORMAT_HINT}` },
  )
  @Transform(toIsoDateOrNull)
  endDate!: string;
}

export class GetCurrencyReportDto {
  @ApiProperty({
    type: String,
    required: false,
    example: '2026-01-01',
    description: 'Fecha inicial del período (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString(
    { strict: false },
    { message: `startDate debe ser ${DATE_FORMAT_HINT}` },
  )
  @Transform(toIsoDateOrNull)
  startDate?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '2026-12-31',
    description: 'Fecha final del período (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString(
    { strict: false },
    { message: `endDate debe ser ${DATE_FORMAT_HINT}` },
  )
  @Transform(toIsoDateOrNull)
  endDate?: string;
}

export class GetExpensesReportDto {
  @ApiProperty({
    type: String,
    required: false,
    example: '2026-01-01',
    description: 'Fecha inicial del período (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString(
    { strict: false },
    { message: `startDate debe ser ${DATE_FORMAT_HINT}` },
  )
  @Transform(toIsoDateOrNull)
  startDate?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '2026-12-31',
    description: 'Fecha final del período (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString(
    { strict: false },
    { message: `endDate debe ser ${DATE_FORMAT_HINT}` },
  )
  @Transform(toIsoDateOrNull)
  endDate?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'RENTA',
    description: 'Categoría de gasto a filtrar',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;
}

export class GetProfitReportDto extends GetPeriodReportDto {}

export class GetCashFlowReportDto extends GetPeriodReportDto {}

export class GetFxPerformanceReportDto extends GetPeriodReportDto {
  @ApiProperty({
    type: String,
    required: false,
    example: 'USD',
    description: 'Código de moneda a filtrar (opcional)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;
}

export class GetAuditSummaryDto {
  @ApiProperty({
    type: String,
    required: false,
    example: '2026-01-01',
    description: 'Fecha inicial del período (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString(
    { strict: false },
    { message: `startDate debe ser ${DATE_FORMAT_HINT}` },
  )
  @Transform(toIsoDateOrNull)
  startDate?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '2026-12-31',
    description: 'Fecha final del período (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString(
    { strict: false },
    { message: `endDate debe ser ${DATE_FORMAT_HINT}` },
  )
  @Transform(toIsoDateOrNull)
  endDate?: string;
}

export class GetCurrencyReportByIdParamDto {
  @ApiProperty({ type: 'integer', minimum: 1, example: 1 })
  @IsInt()
  @Min(1)
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() !== ''
      ? Number(value)
      : value,
  )
  id!: number;
}
