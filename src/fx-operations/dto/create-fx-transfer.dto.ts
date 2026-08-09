import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min, ValidateIf } from 'class-validator';
import { FxOperationKind, TransactionType, TransferAccountType } from '@prisma/client';

export class CreateFxTransferDto {
  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty()
  @IsInt()
  currencyId: number;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(9999999999999.99)
  amount: number;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  @Max(999999.9999)
  rate: number;

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

  @ApiPropertyOptional({ description: 'Profit credited to the worker balance in workerCurrencyId' })
  @IsOptional()
  @ValidateIf((dto) => dto.workerId !== undefined)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999999.99)
  workerProfit?: number;

  @ApiPropertyOptional({ description: 'Currency of the worker profit' })
  @ValidateIf((dto) => dto.workerId !== undefined)
  @IsInt()
  workerCurrencyId?: number;
}
