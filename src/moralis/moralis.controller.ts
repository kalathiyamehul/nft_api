import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MoralisService } from './moralis.service';
import { GetNFTs } from './dto/create-morali.dto';

@Controller('moralis')
export class MoralisController {
  constructor(private readonly moralisService: MoralisService) { }

  @Post('getNft')
  getAllNFT(@Body() getNFTs: GetNFTs) {
    return this.moralisService.getAllNFT(getNFTs);
  }
  @Post('getCollection')
  getCollection(@Body() getNFTs: GetNFTs) {
    return this.moralisService.getCollection(getNFTs);
  }

}
