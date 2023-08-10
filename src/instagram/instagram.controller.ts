import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateAccessTokenDto } from './dto/create-access-token.dto';
import { InstagramService } from './instagram.service';

@ApiTags('Instagram')
@Controller('instagram')
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) { }

  @Post('access-token')
  create(@Body() createAccessTokenDto: CreateAccessTokenDto) {
    return this.instagramService.createe(createAccessTokenDto);
  }
}
