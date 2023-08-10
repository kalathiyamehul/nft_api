import { Controller, Post, Req, UseGuards, Body } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteDto } from './dto/favorite.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Favorite User')
@Controller('favorite_user')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('/addFavorite')
  addlfavorite(@Body() favoriteDto: FavoriteDto, @Req() req) {
    const user_id = req?.user?.payload?.id
    return this.favoriteService.addFavorite(favoriteDto, user_id);
  }

}
