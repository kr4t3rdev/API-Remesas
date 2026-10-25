import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsDecimalString } from '../../common/decorators/is-decimal-string.decorator';

export class CreateBankAccountDto {
  @ApiProperty({ example: 'Cuenta Principal' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Banco Popular' })
  @IsString()
  @IsNotEmpty()
  bankName!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  currencyId!: number;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  accountNumber!: string;

  @ApiProperty({ example: '1000.00', description: 'Saldo inicial en decimal string', type: String, required: false })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsDecimalString({ min: '0' })
  initialBalance?: string;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
