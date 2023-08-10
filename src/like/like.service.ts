import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, getRepository, Repository } from 'typeorm';
import {  TypeRole } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { LikesSchema } from './entities/like.entity';
import { FCMService } from 'src/fcm-notification/fcm.service';
import { UserSchema } from '../users/entities/user.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(LikesSchema) private likeRepository: Repository<LikesSchema>,
    private fcmService: FCMService
  ) { }
  queryManager = getManager();
  userRepository = getRepository(UserSchema);
  async addDeletelike(type:string, type_id:number, user_id: number) {
    var checkType;
    if (type == 'reels')
      checkType = `select * from reels where id=${type_id}`
    if (type == 'nfts')
      checkType = `select * from nfts where id=${type_id}`
    if (type == 'collections')
      checkType = `select * from collection where id=${type_id}`
    if (type == 'posts')
      checkType = `select * from posts where id=${type_id}`
    const checkTypedata=await this.queryManager.query(checkType)
    if (checkTypedata?.length <= 0) {
      return {
        data: false,
        message: `${type} Not Found`
      }
    }
    const checkCommentQuery = `select * from likes where 
    type='${type}' and type_id=${type_id} 
    and "authorId"=${user_id}`;
    const checkData = await this.queryManager.query(checkCommentQuery);
    if (checkData?.length > 0) {
      const inserQuery = `DELETE FROM public.likes
	  WHERE type='${type}' and type_id=${type_id} 
    and "authorId"=${user_id};`
      await this.queryManager.query(inserQuery)
        .then(async (res) => {
          let total_like;
          if (type == 'reels') 
            total_like = `update reels set total_like=total_like-1 where id=${type_id}`
          if (type == 'nfts') 
            total_like = `update nfts set total_like=total_like-1 where id=${type_id}`
          if (type == 'collections') 
            total_like = `update collection set total_like=total_like-1 where id=${type_id}`
          if (type == 'posts') 
            total_like = `update posts set total_like=total_like-1 where id=${type_id}`
          this.queryManager.query(total_like)
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
        message: "Like Deleted"
      }
    }
    else {
      const inserQuery = `INSERT INTO likes(
	                  type, type_id, "authorId")
	                  VALUES ('${type}'
                    ,${type_id},
                       ${user_id});`
        await this.queryManager.query(inserQuery)
          .then( async (res) => {
            let total_like;
            if (type =='reels')
              total_like = `update reels set total_like=total_like+1 where id=${type_id}`
            if (type == 'nfts')
              total_like = `update nfts set total_like=total_like+1 where id=${type_id}`
            if (type == 'collections')
              total_like = `update collection set total_like=total_like+1 where id=${type_id}`
            if (type == 'posts')
              total_like = `update posts set total_like=total_like+1 where id=${type_id}`
            this.queryManager.query(total_like);

            //Send notification 
            const user = await this.userRepository.findOne({ id: +user_id });
            const noti_data = {
              type: type,
              type_id: type_id.toString(),
              user_id: user_id.toString()
            }
            const notification_type = "LIKE";
            this.fcmService.send(checkTypedata[0]?.authorId, "Horizon", "liked your "+ type, noti_data, user_id, notification_type);
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
          data:true,
          message: "Like Added"
        }
    }
  }
  async checkLike(type: string, type_id: number, user_id: number) {
    const checkCommentQuery = `select * from likes where 
    type='${type}' and type_id=${type_id} 
    and "authorId"=${user_id}`;
    // console.log(checkCommentQuery);
    const checkData = await this.queryManager.query(checkCommentQuery);
    if (checkData?.length > 0) {
      return {
        status: 200,
        data:true
      }
    }
    else {
      return {
        status: 200,
        data: false
      }
    }
  }
  async checkdoubleLike(type: string, type_id: number, user_id: number) {
    const checkCommentQuery = `select double_like from likes where 
    type='${type}' and type_id=${type_id} 
    and "authorId"=${user_id}`;
    const checkData = await this.queryManager.query(checkCommentQuery);
    console.log(checkData)
    if (checkData?.length > 0 && checkData[0]?.double_like) {
      return {
        status: 200,
        data: true
      }
    }
    else {
      return {
        status: 200,
        data: false
      }
    }
  }
  async adddoublelike(type: string, type_id: number, user_id: number) {
    var checkType;
    if (type == 'reels')
      checkType = `select * from reels where id=${type_id}`
    if (type == 'nfts')
      checkType = `select * from nfts where id=${type_id}`
    if (type == 'collections')
      checkType = `select * from collection where id=${type_id}`
    const checkTypedata = await this.queryManager.query(checkType)
    if (checkTypedata?.length <= 0) {
      return {
        data: false,
        message: `${type} Not Found`
      }
    }
    const checkCommentQuery = `select double_like from likes where 
    type='${type}' and type_id=${type_id} 
    and "authorId"=${user_id}`;
    const checkData = await this.queryManager.query(checkCommentQuery);
    if (checkData?.length > 0 && checkData[0]?.double_like) {
      const inserQuery = `update likes
       set double_like=false
	  WHERE type='${type}' and type_id=${type_id} 
    and "authorId"=${user_id};`
      await this.queryManager.query(inserQuery)
        .then(async (res) => {
          let total_double_like;
          if (type == 'reels')
            total_double_like = `update reels set total_double_like=total_double_like-1 where id=${type_id}`
          if (type == 'nfts')
            total_double_like = `update nfts set total_double_like=total_double_like-1 where id=${type_id}`
          if (type == 'collections')
            total_double_like = `update collection set total_double_like=total_double_like-1 where id=${type_id}`
          this.queryManager.query(total_double_like)
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
        message: "Like Deleted"
      }
    }
    else {
      const inserQuery = `update likes
       set double_like=true
	  WHERE type='${type}' and type_id=${type_id} 
    and "authorId"=${user_id};`
      await this.queryManager.query(inserQuery)
        .then((res) => {
          let total_double_like;
          if (type == 'reels')
            total_double_like = `update reels set total_double_like=total_double_like+1 where id=${type_id}`
          if (type == 'nfts')
            total_double_like = `update nfts set total_double_like=total_double_like+1 where id=${type_id}`
          if (type == 'collections')
            total_double_like = `update collection set total_double_like=total_double_like+1 where id=${type_id}`
          this.queryManager.query(total_double_like)
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
        message: "Double Like Added"
      }
    }
  }

}
