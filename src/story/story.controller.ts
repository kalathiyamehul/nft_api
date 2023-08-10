import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put } from '@nestjs/common';
import { StoryService } from './story.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Locarnoa')
@Controller()
export class StoryController {
  constructor(private readonly storyService: StoryService) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('stories/add')
  create(@Body() createStoryDto: CreateStoryDto, @Req() req) {
    const id = req?.user?.payload?.id;
    return this.storyService.create(createStoryDto, id);
  }

  @Get('stories/getAll')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  findAll(@Req() req) {
    const user_id = req?.user?.payload?.id;
    return this.storyService.findAll(user_id);
  }

  // @ApiBearerAuth()
  // @UseGuards(AuthGuard())
  // @Patch('stories/update/:id')
  // update(@Param('id') id: string, @Body() updateStoryDto: UpdateStoryDto, @Req() req) {
  //   const user_id = req?.user?.payload?.id;
  //   return this.storyService.update(+id, updateStoryDto, user_id);
  // }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Delete('stories/delete/:id')
  remove(@Param('id') id: string) {
    return this.storyService.remove(+id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Put('stories/update/:id')
  statusUpdate(@Param('id') id: string, @Body() updateStoryDto: UpdateStoryDto) {
    return this.storyService.statusUpdate(+id, updateStoryDto);
  }

}
