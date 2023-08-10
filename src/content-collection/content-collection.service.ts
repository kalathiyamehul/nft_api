import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, getRepository, Repository } from 'typeorm';
import { ContentCollectionSchema } from './entities/content-collection.entity';
import { UserSchema } from '../users/entities/user.entity';
import { ReelsSchema } from 'src/reels/entities/reel.entity';
import { NftSchema } from 'src/nft/entities/nft.entity';

@Injectable()
export class ContentCollectionService {
  constructor(
    @InjectRepository(ContentCollectionSchema)
    private contentCollectionRepository: Repository<ContentCollectionSchema>,
  ) {}
  queryManager = getManager();
  userRepository = getRepository(UserSchema);
  reelsReository = getRepository(ReelsSchema);
  nftReository = getRepository(NftSchema);
  async addDeletecollection(type: string, type_id: number, user_id: number) {
    var checkType;
    if (type == 'posts') checkType = `select * from posts where id=${type_id}`;
    else if (type == 'reels')
      checkType = `select * from reels where id=${type_id}`;
    const checkTypedata = await this.queryManager.query(checkType);
    if (checkTypedata?.length <= 0) {
      return {
        data: false,
        message: `${type} Not Found`,
      };
    }
    const checkcollectionQuery = `select * from content_collection where 
      type='${type}' and type_id=${type_id} and "authorId"=${user_id}`;
    const checkData = await this.queryManager.query(checkcollectionQuery);
    if (checkData?.length > 0) {
      const inserQuery = `DELETE FROM public.content_collection
        WHERE type='${type}' and type_id=${type_id} 
        and "authorId"=${user_id};`;
      await this.queryManager
        .query(inserQuery)
        .then(async (res) => {})
        .catch((err) => {
          return {
            status: 500,
            data: false,
            message: 'Something Went Wrong',
          };
        });
      return {
        status: 200,
        data: true,
        message: 'Collection Deleted',
      };
    } else {
      const inserQuery = `INSERT INTO content_collection(type, type_id, "authorId")
	                  VALUES ('${type}',${type_id},${user_id});`;
      await this.queryManager
        .query(inserQuery)
        .then((res) => {})
        .catch((err) => {
          return {
            status: 500,
            data: false,
            message: 'Something Went Wrong',
          };
        });
      return {
        status: 200,
        data: true,
        message: 'Collection Added',
      };
    }
  }
  async checkcollection(type: string, type_id: number, user_id: number) {
    const checkCommentQuery = `select * from content_collection where 
    type='${type}' and type_id=${type_id} 
    and "authorId"=${user_id}`;
    // console.log(checkCommentQuery);
    const checkData = await this.queryManager.query(checkCommentQuery);
    if (checkData?.length > 0) {
      return {
        status: 200,
        data: true,
      };
    } else {
      return {
        status: 200,
        data: false,
      };
    }
  }
  async findByAuthorID(type: string, page: number, user_id: number) {
    if (!page || page == NaN || page == 0) {
      page = 1;
    }
    const limit = +process.env?.CONTENT_COLLECTION_LIMIT;
    const offset = (page - 1) * limit;
    const reqData = this.contentCollectionRepository
      .createQueryBuilder('contentcollections')
      .select('type_id')
      .where(`contentcollections.authorId = ${user_id}`)
      .andWhere(`contentcollections.type= '${type}'`)
      .getSql();

    var resp;
    if (type == 'reels') {
      const Query = `select reels.*, users.username AS author_username, users.profile_photo AS author_profile_photo,
      CASE WHEN (SELECT id FROM public.follows_users where "followerId" = ${user_id} and "followeeId" = reels."authorId") > 0 THEN true ELSE false END AS is_follow,
      CASE WHEN (SELECT id FROM public.likes WHERE type='reels' AND "authorId" = ${user_id} AND type_id = reels.id) > 0 THEN true ELSE false END AS is_liked,
      CASE WHEN (SELECT id FROM public.favorite_user WHERE LOWER(request_from)='reels' AND "authorId" = ${user_id} AND user_id = reels."authorId") > 0 THEN true ELSE false END AS is_favotite_user,
      CASE WHEN (SELECT id FROM public.content_collection WHERE LOWER(type)='reels' AND "authorId" = ${user_id} AND type_id = reels.id) > 0 THEN true ELSE false END AS is_in_collection
      from reels
      LEFT JOIN users ON users.id = "authorId"
      LEFT JOIN reels_like likes on likes.hashtag in (reels.hashtags) AND likes."authorId" = ${user_id}
      LEFT JOIN favorite_user favorite on favorite.user_id = reels."authorId" AND favorite."authorId" = ${user_id}
      LEFT JOIN reels_order ON reels_order.category = reels.category AND reels_order."authorId" = ${user_id}
      WHERE reels.id IN (${reqData})
        OFFSET ${offset}
        LIMIT ${limit}`;
      resp = await this.queryManager.query(Query);
    } else if (type == 'posts') {
      const Query = `SELECT posts.*, users.username AS author_username, users.profile_photo AS author_profile_photo,
      CASE WHEN (SELECT id FROM public.follows_users where "followerId" = ${user_id} and "followeeId" = "authorId") > 0 THEN true ELSE false END AS is_follow,
      CASE WHEN (SELECT id FROM public.likes WHERE type='posts' AND "authorId" = ${user_id} AND type_id = posts.id) > 0 THEN true ELSE false END AS is_liked,
      CASE WHEN (SELECT id FROM public.favorite_user WHERE LOWER(request_from)='posts' AND "authorId" = ${user_id} AND user_id = "authorId") > 0 THEN true ELSE false END AS is_favotite_user,
      CASE WHEN (SELECT id FROM public.content_collection WHERE LOWER(type)='posts' AND "authorId" = ${user_id} AND type_id = posts.id) > 0 THEN true ELSE false END AS is_in_collection
      FROM posts
      LEFT JOIN users ON users.id = "authorId"
      WHERE posts.id IN (${reqData})
      OFFSET ${offset}
      LIMIT ${limit}`;
      resp = await this.queryManager.query(Query);
    }
    return resp;
  }
}
