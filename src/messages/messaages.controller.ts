import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  Delete
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddMessageDto } from './dto/add-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { ReadMessagesDto } from './dto/read-messages.dto';
import { MessagesService } from './messages.service';



@ApiTags('Message')
@Controller()
export class MessagesController {
  constructor(private readonly messagesService : MessagesService) { }
  
  @Post('addmsg')
  addMessage(@Body() addMessageDto: AddMessageDto) {
    return this.messagesService.addMessage(addMessageDto);
  }

  @Post('getmsg')
  getMessages(@Body() getMessagesDto: GetMessagesDto) {
    return this.messagesService.getMessages(getMessagesDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('getusers/:id')
  getUsers(@Req() req) {
    const user_id = req?.user?.payload?.id
    return this.messagesService.getUserList(user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('readmsg')
  readMessage(@Body() readMessagesDto: ReadMessagesDto) {
    return this.messagesService.readMessage(readMessagesDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Delete('deletemsg/:id')
  deleteMessage(@Param('id') id: number,@Req() req) {
    const user_id = req?.user?.payload?.id
    return this.messagesService.deleteMessage(id,user_id);
  }
  
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Delete('deleteallmsg/:userId')
  deleteAllMessage(@Param('userId') to_id: number,@Req() req) {
    const user_id = req?.user?.payload?.id
    return this.messagesService.deleteAllMessage(to_id,user_id);
  }
  
}
