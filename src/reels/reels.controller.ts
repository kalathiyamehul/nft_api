import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put } from '@nestjs/common';
import { ReelsService } from './reels.service';
import { CreateReelDto, WatchReelDto } from './dto/create-reel.dto';
import { UpdateReelDto } from './dto/update-reel.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('reels')
@Controller('reels')
export class ReelsController {
  constructor(private readonly reelsService: ReelsService) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('/create_reel')
  create(@Body() createReelDto: CreateReelDto, @Req() req) {
    const id = req?.user?.payload?.id
    return this.reelsService.create(createReelDto, id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/getLanguageAndCategory')
  getLanguageAndCategory() {
    return this.reelsService.getLanguageAndCategory();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/getReelsByAuthorID/:user_id/:page')
  getReelsByAuthorID(@Param('page') page: number, @Param('user_id') user_id: number) {
    return this.reelsService.getReelsByAuthorID(page, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/getTrandingReels/:page/:firstReel')
  getTrandingReels(@Param('page') page: number, @Param('firstReel') firstReel: number, @Req() req) {
    const user_id = req?.user?.payload?.id
    return this.reelsService.getTrandingReels(page, user_id, firstReel);
  }

  @Get('/:id')
  getTrandingReelsById(@Param('id') id: string) {
    return this.reelsService.getReelsById(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/audio_search/:search')
  getAudioList(@Param('search') search: string) {
    return this.reelsService.getAudioList(search);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Patch('/updatemetadata/:id')
  update(@Param('id') id: string, @Body() updateReelDto: UpdateReelDto, @Req() req) {
    const user_id = req?.user?.payload?.id
    return this.reelsService.update(+id, updateReelDto, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('/watchreel')
  watchreel(@Body() watchReelDto: WatchReelDto, @Req() req) {
    const user_id = req?.user?.payload?.id
    return this.reelsService.watch(watchReelDto, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Delete('/deletereels/:id')
  remove(@Param('id') id: string, @Req() req) {
    const user_id = req?.user?.payload?.id
    return this.reelsService.remove(+id, user_id);
  }
}
