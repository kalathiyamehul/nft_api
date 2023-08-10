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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FollowsService } from './follows.service';
import { CreateFollowingDto, RemoveDto } from './dto/create-following.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Follow')
@Controller('follow')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post()
  createFollowing(@Body() createFollowingDto: CreateFollowingDto, @Req() req) {
    const id = req?.user?.payload?.id;
    return this.followsService.createFollowing(createFollowingDto, +id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('remove-following')
  removeFollowing(@Body() removeDto: RemoveDto, @Req() req) {
    const id = req?.user?.payload?.id;
    let friend_id = removeDto?.id;
    return this.followsService.removeFollowing(friend_id, +id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('remove-follower')
  removeFollowers(@Body() removeDto: RemoveDto, @Req() req) {
    const id = req?.user?.payload?.id;
    let friend_id = removeDto?.id;
    return this.followsService.removeFollower(friend_id, +id);
  }

  @Get('user-following/:id/:page')
  following(@Param('id') id: string, @Param('page') page: number) {
    return this.followsService.userFollowing(+id, +page);
  }

  @Get('user-followers/:id/:page')
  followers(@Param('id') id: string, @Param('page') page: number) {
    return this.followsService.userFollowers(+id, +page);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('my-following')
  myFollowing(@Req() req) {
    const id = req?.user?.payload?.id;
    return this.followsService.myFollowing(+id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('my-followers')
  myFollowers(@Req() req) {
    const id = req?.user?.payload?.id;
    return this.followsService.myFollowers(+id);
  }
}
