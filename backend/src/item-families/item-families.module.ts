import { Module } from '@nestjs/common';
import {
  ItemFamiliesController,
  ItemSubfamiliesController,
} from './item-families.controller';
import { ItemFamiliesService } from './item-families.service';

@Module({
  controllers: [ItemFamiliesController, ItemSubfamiliesController],
  providers: [ItemFamiliesService],
  exports: [ItemFamiliesService],
})
export class ItemFamiliesModule {}
