import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { FutureVisiteService } from './future-visite.service';
import { CreateFutureVisiteDto } from './dto/create-future-visite.dto';
import { UpdateFutureVisiteDto } from './dto/update-future-visite.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';


@ApiTags('Locarnoa')
@Controller()
export class FutureVisiteController {
  constructor(private readonly futureVisiteService: FutureVisiteService) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('future-visite/add')
  create(@Body() createFutureVisiteDto: CreateFutureVisiteDto, @Req() req) {
    const id = req?.user?.payload?.id;
    return this.futureVisiteService.create(createFutureVisiteDto, id);
  }

  @Get('future-visite/getAll')
  findAll() {
    return this.futureVisiteService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Patch('future-visite/update/:id')
  update(@Param('id') id: string, @Body() updateFutureVisiteDto: UpdateFutureVisiteDto) {
    return this.futureVisiteService.update(+id, updateFutureVisiteDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Delete('future-visite/delete/:id')
  remove(@Param('id') id: string) {
    return this.futureVisiteService.remove(+id);
  }
}
