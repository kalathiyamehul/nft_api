import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetNftQueryDto } from 'src/nft/dto/create-nft.dto';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { CompileContract } from './dto/create_newCollection';
import { UpdateCollectionDto } from './dto/update-collection.dto';
@ApiTags('Collection')
@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post()
  create(@Req() req, @Body() createCollectionDto: CreateCollectionDto) {
    const id = req?.user?.payload?.id || 1;
    return this.collectionService.create(createCollectionDto, id);
  }

  @Get('compile/:collection_name/:collection_symbol')
  compileCotract(@Param() paramas: CompileContract) {
    return this.collectionService.compilcontacrt(paramas);
  }

  @Get()
  findAll() {
    return this.collectionService.findAll();
  }

  @Get('tranding')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  getTrandingCollection(@Query() query: GetNftQueryDto, @Req() req) {
    const user_id = req?.user?.payload?.id;
    return this.collectionService.getTrandingCollection(query, user_id);
  }

  @Get('/findById')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  findByUserId(@Req() req) {
    const id = req?.user?.payload?.id || 1;
    return this.collectionService.findById(id);
  }
 
  @Get('/findByUserId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  findByUser(@Req() req) {
    const id = req?.user?.payload?.id;
    return this.collectionService.findByUserId(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard()) 
  @Get('/findByAuthorID/:user_id/:page')
  findByAuthorID(@Param('page') page: number, @Param('user_id') user_id: number) {
    return this.collectionService.findByAuthorID(page, user_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collectionService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCollectionDto: UpdateCollectionDto) {
    return this.collectionService.update(+id, updateCollectionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.collectionService.remove(+id);
  }
}
