import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TransactionType, TransferAccountType } from '@prisma/client';

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
