import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClosefriendService } from './closefriend.service';
import { CreateClosefriendDto } from './dto/create-closefriend.dto';
import { UpdateClosefriendDto } from './dto/update-closefriend.dto';

@ApiTags('Close Friend')
@Controller('closefriend')
export class ClosefriendController {
  constructor(private readonly closefriendService: ClosefriendService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('addIntoCloseFriend/:closefriendID')
  addIntoCloseFriend(@Param('closefriendID') closefriendID: number, @Req() req) {
    const user_id = req?.user?.payload?.id
    return this.closefriendService.addIntoCloseFriend(closefriendID,user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Delete('removeFromCloseFriend/:closefriendID')
  removeFromCloseFriend(@Param('closefriendID') closefriendID: number, @Req() req) {
    const user_id = req?.user?.payload?.id
    return this.closefriendService.removeFromCloseFriend(closefriendID, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/closeFriendList')
  closeFriendList(@Req() req) {
    const user_id = req?.user?.payload?.id
    return this.closefriendService.closeFriendList(user_id);
  }
}
