import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, Req, Query } from '@nestjs/common';
import { NftService } from './nft.service';
import { CreateNftAppDto, CreateNftDBDto, CreateNftDto, GetNftQueryDto } from './dto/create-nft.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateNftDto } from './dto/update-nft.dto';
import { AuthGuard } from '@nestjs/passport';
import { MyAuthGuard } from 'src/auth/jwt.strategy';

@ApiTags('Nft')
  @Controller('nfts')
export class NftController {
  constructor(private readonly nftService: NftService) { }

  @ApiBearerAuth()
  @UseGuards(MyAuthGuard)
  @Post('/generate_nft')
  generateNft(@Body() generate_dto: CreateNftDBDto, @Req() req) {
    const id = req?.user?.payload?.id
    return this.nftService.generateNft(generate_dto, id);
  }
  @Get('/')
  getallnft(@Query() query: GetNftQueryDto) {
    return this.nftService.find(query);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard()) 
  @Get('/tranding')
  getTandingnft(@Query() query: GetNftQueryDto, @Req() req) {
    const user_id = req?.user?.payload?.id
    return this.nftService.getTrandingNft(query, user_id);
  }
  
  @ApiBearerAuth()
  @UseGuards(AuthGuard()) 
  @Get('/latest')
  getLatestnft(@Req() req) {
    const id = req?.user?.payload?.id;
    return this.nftService.getLatestNft(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard()) 
  @Get('/findByAuthorID/:user_id/:page')
  findByAuthorID(@Param('page') page: number, @Param('user_id') user_id: number) {
    return this.nftService.findByAuthorID(page, user_id);
  }


  @Get('/getTrendingArtwork')
  getTrendingArtwork() {
    return this.nftService.getTrendingArtwork();
  }

  @Get('/getFeaturedArtwork')
  getFeaturedArtwork() {
    return this.nftService.getFeaturedArtwork();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('/save_nft')
  save_nft(@Body() generate_dto: CreateNftDBDto, @Req() req) {
    const id = req?.user?.payload?.id
    return this.nftService.save_nft(generate_dto, id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('/create_nft')
  create_new_nft(@Body() createNftAppDto: CreateNftAppDto, @Req() req) {
    const id = req?.user?.payload?.id;
    return this.nftService.create_new_nft(createNftAppDto, id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Put('/update_nft/:id')
  update(@Param('id') id: string, @Body() generate_dto: UpdateNftDto, @Req() req) {
    const userId = req?.user?.payload?.id;
    return this.nftService.update_nft(+id, generate_dto, userId);
  }

  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.nftService.delete(+id);
  }

  @Get('/:id')
  findOneById(@Param('id') id: string) {
    return this.nftService.findOneById(+id);
  }

  @Post('/setup')
  setup() {
    return this.nftService.buildSetup();
  }

}
