import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { LocarnoService } from './locarno.service';
import { NearByUserDto, recentActivity } from './dto/update-locarno.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateLocationDto } from './dto/create-locarno.dto';

@ApiTags("Location")
  @Controller('location')
export class LocarnoController {
  constructor(private readonly locarnoService: LocarnoService) {}

  @Post('nearByUser')
  findAll(@Body() nearByUserDto: NearByUserDto) {
    return this.locarnoService.nearByUser(nearByUserDto);
  }
  @Get('getRecentActivity')
  getRecentActivity(@Query() recentActivity: recentActivity) {
    return this.locarnoService.getRecentActivity(recentActivity);
  }
  
  @Post('addLocation')
  addLocation(@Body() createLocationDto: CreateLocationDto) {
    return this.locarnoService.addLocation(createLocationDto);
  }
  @Get('getLocation')
  getLocation() {
    return this.locarnoService.getLocation();
  }

}
