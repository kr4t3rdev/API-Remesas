import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { FxOperationKind, TransactionType, TransferAccountType } from '@prisma/client';

export class CreateFxTransferDto {
  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty()
  @IsInt()
  currencyId: number;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty()
  @IsNumber()
  @Min(0.000001)
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
}
