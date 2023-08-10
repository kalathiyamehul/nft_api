import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetNftQueryDto } from 'src/nft/dto/create-nft.dto';
import { AuctionsService } from './auctions.service';
import { CreateAuctionDto, EditAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';

@ApiTags('Auctions')
@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post()
  create(@Body() createAuctionDto: CreateAuctionDto, @Req() req) {
    const id = req?.user?.payload?.id
    return this.auctionsService.create(createAuctionDto, id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Put()
  edit(@Body() editAuctionDto: EditAuctionDto, @Req() req) {
    const id = req?.user?.payload?.id
    return this.auctionsService.update(editAuctionDto, id);
  }

  @Get()
  findAll() {
    return this.auctionsService.findAll();
  }

  @Get('tranding')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  getTrandingAuction(@Query() query: GetNftQueryDto, @Req() req) {
    const user_id = req?.user?.payload?.id;
    return this.auctionsService.getTrandingAuction(query, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/getUserAuctions')
  getUserAuctions(@Req() req) {
    const id = req?.user?.payload?.id
    return this.auctionsService.getUserAuctions(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auctionsService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.auctionsService.remove(+id);
  }
}
