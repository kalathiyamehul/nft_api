import { Module } from '@nestjs/common';
import { MoralisService } from './moralis.service';
import { MoralisController } from './moralis.controller';

@Module({
  controllers: [MoralisController],
  providers: [MoralisService]
})
export class MoralisModule {}
