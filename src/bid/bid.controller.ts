import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BidService } from './bid.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';

@ApiTags('Bid')
@Controller('bids')
export class BidController {
  constructor(private readonly bidService: BidService) {}


  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post()
  create(@Body() createBidDto: CreateBidDto, @Req() req) {
    const id = req?.user?.payload?.id
    return this.bidService.create(createBidDto, id);
  }

  @Get()
  findAll() {
    return this.bidService.findAll();
  }

  @Get('findOneByNftId/:id')
  findOne(@Param('id') id: string) {
    return this.bidService.findOneByNftId(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBidDto: UpdateBidDto) {
    return this.bidService.update(+id, updateBidDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bidService.remove(+id);
  }
}
