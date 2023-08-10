import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { IllustrationService } from './illustration.service';
import { CreateIllustrationDto } from './dto/create-illustration.dto';
import { UpdateIllustrationDto } from './dto/update-illustration.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Locarnoa')
@Controller()
export class IllustrationController {
  constructor(private readonly illustrationService: IllustrationService) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('illustration/add')
  create(@Body() createIllustrationDto: CreateIllustrationDto, @Req() req) {
    const id = req?.user?.payload?.id;
    return this.illustrationService.create(createIllustrationDto, id);
  }

  @Get('illustration/getAll')
  findAll() {
    return this.illustrationService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Patch('illustration/update/:id')
  update(@Param('id') id: string, @Body() updateIllustrationDto: UpdateIllustrationDto) {
    return this.illustrationService.update(+id, updateIllustrationDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Delete('illustration/delete/:id')
  remove(@Param('id') id: string) {
    return this.illustrationService.remove(+id);
  }
}
