import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTOs for the Expense Items module.
 *
 * Monetary fields are decimal strings (task 1.14 decision).
 */

export class ExpenseItemDto {
  @ApiProperty({ example: 10 })
  id!: number;

  @ApiProperty({ example: 7 })
  userId!: number;

  @ApiProperty({ example: 'Alquiler oficina' })
  name!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  amount!: string;

  @ApiProperty({ example: 'renta', nullable: true })
  category!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class ExpenseItemReportItemDto extends ExpenseItemDto {}

export class ExpenseItemReportDto {
  @ApiProperty({ type: [ExpenseItemReportItemDto] })
  items!: ExpenseItemReportItemDto[];

  @ApiProperty({ type: String, description: 'Decimal como string' })
  total!: string;

  @ApiProperty({ example: 12 })
  count!: number;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  average!: string;

  @ApiProperty({ nullable: true, description: 'Rango efectivo del período cuando aplica' })
  period!: { start: string; end: string } | null;
}
