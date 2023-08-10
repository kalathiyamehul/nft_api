import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FCMService } from './fcm.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('FCM')
@Controller("fcm")
export class FCMController {
  constructor(private readonly fcmService: FCMService) { }

  @Post('send_notification')
  sendNotification(user_id: number, title:string, message:string, data:string, login_user_id:number, notification_type:string) {
    return this.fcmService.send(user_id, title, message, data, login_user_id, notification_type);
  }
  
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/:page')
  getNotification(@Param('page') page: number, @Req() req) {
    const user_id = req?.user?.payload?.id;
    return this.fcmService.get(+page, +user_id);
  }

}
