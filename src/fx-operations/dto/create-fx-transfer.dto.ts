import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, ValidateIf } from 'class-validator';
import { FxOperationKind, TransactionType, TransferAccountType } from '@prisma/client';
import { IsDecimalString } from '../../common/decorators/is-decimal-string.decorator';

export class CreateFxTransferDto {
  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty()
  @IsInt()
  currencyId: number;

  @ApiProperty({ type: String, example: '100.00', description: 'Importe en decimal string' })
  @IsDecimalString({ min: '0.01', max: '9999999999999.99', maxDecimalPlaces: 2 })
  amount: string;

  @ApiProperty({ type: String, example: '180.5', description: 'Tasa en decimal string' })
  @IsDecimalString({ min: '0.0001', max: '999999.9999', maxDecimalPlaces: 4 })
  rate: string;

  @ApiPropertyOptional({ enum: FxOperationKind, default: FxOperationKind.TRANSFER })
  @IsOptional()
  @IsEnum(FxOperationKind)
  operationKind?: FxOperationKind;

  @ApiPropertyOptional({ default: false, description: 'Persist this effective rate as the active rate for this transaction side' })
  @IsOptional()
  @IsBoolean()
  persistRate?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: TransferAccountType, default: TransferAccountType.CASH })
  @IsOptional()
  @IsEnum(TransferAccountType)
  sourceType?: TransferAccountType;

  @ApiPropertyOptional({ description: 'Bank account used as source when sourceType is BANK_ACCOUNT' })
  @IsOptional()
  @IsInt()
  sourceBankAccountId?: number;

  @ApiPropertyOptional({ enum: TransferAccountType, default: TransferAccountType.CASH })
  @IsOptional()
  @IsEnum(TransferAccountType)
  destinationType?: TransferAccountType;

  @ApiPropertyOptional({ description: 'Bank account receiving funds when destinationType is BANK_ACCOUNT' })
  @IsOptional()
  @IsInt()
  destinationBankAccountId?: number;

  @ApiPropertyOptional({ description: 'Worker receiving profit from this FX operation' })
  @IsOptional()
  @IsInt()
  workerId?: number;

  @ApiPropertyOptional({ description: 'Profit credited to the worker balance in workerCurrencyId', type: String, example: '25.50' })
  @IsOptional()
  @ValidateIf((dto) => dto.workerId !== undefined)
  @IsDecimalString({ min: '0', max: '9999999999999.99', maxDecimalPlaces: 2 })
  workerProfit?: string;

  @ApiPropertyOptional({ description: 'Currency of the worker profit' })
  @ValidateIf((dto) => dto.workerId !== undefined)
  @IsInt()
  workerCurrencyId?: number;
}
