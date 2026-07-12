import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { FxOperationsModule } from '../fx-operations/fx-operations.module';
import { RemittancesController } from './remittances.controller';
import { RemittancesService } from './remittances.service';

@Module({ imports: [ConfigModule, DatabaseModule, FxOperationsModule], controllers: [RemittancesController], providers: [RemittancesService], exports: [RemittancesService] })
export class RemittancesModule {}
