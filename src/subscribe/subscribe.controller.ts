import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put } from '@nestjs/common';
import {  ApiTags } from '@nestjs/swagger';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { SubscribeService } from './subscribe.service';

@ApiTags('Subscribe')
@Controller('subscribe')
export class SubscribeController {
  constructor(private readonly subscribeService: SubscribeService) { }


  @Post()
  create(@Body() createSubscriberDto: CreateSubscriberDto) {
    return this.subscribeService.add(createSubscriberDto);
  }

}
