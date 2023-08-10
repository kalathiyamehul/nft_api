import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MyAuthGuard } from '../auth/jwt.strategy';
import { ContactusService } from './contactus.service';
import { CreateContactusDto } from './dto/create-contactus.dto';

@ApiTags('Contactus')
@Controller('contactus')
export class ContactusController {
  constructor(private readonly contactusservice: ContactusService) {}

  @Post('create')
  create(@Body() createContactusDto: CreateContactusDto) {
    return this.contactusservice.create(createContactusDto);
  }
  
  @Get('')
  findAll() {
    return this.contactusservice.findAll();
  }
  
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.contactusservice.findOne(id);
  // }

}
