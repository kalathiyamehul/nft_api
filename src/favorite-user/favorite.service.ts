import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, getRepository, Repository } from 'typeorm';
import { FavoriteSchema } from './entities/favorite.entity';
import { UserSchema } from '../users/entities/user.entity';
import { FavoriteDto } from './dto/favorite.dto';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(FavoriteSchema) private favoriteRepository: Repository<FavoriteSchema>,
  ) { }
  queryManager = getManager();
  userRepository = getRepository(UserSchema);

  async addFavorite(favoriteDto: FavoriteDto, user_id: number) {
    const checkCommentQuery = `select * from favorite_user where "authorId"='${user_id}' and user_id=${favoriteDto.user_id}`;
    const checkData = await this.queryManager.query(checkCommentQuery);
    if (checkData?.length > 0) {
      const inserQuery = `DELETE FROM public.favorite_user WHERE user_id=${favoriteDto.user_id} and "authorId"=${user_id};`
      await this.queryManager.query(inserQuery)
        .then(async (res) => {
        })
        .catch((err) => {
          return {
            status: 500,
            data: false,
            message: "Something Went Wrong"
          }
        });
      return {
        status: 200,
        data: true,
        message: "Remove Favorite"
      }
    }
    else {
      const user = await this.userRepository.findOne({ id: user_id });
      const data = await this.favoriteRepository.save({
        ...favoriteDto,
        author: user
      });
      return {
        status: 200,
        data: data,
        message: "Favorite Added"
      }
    }
  }

}
