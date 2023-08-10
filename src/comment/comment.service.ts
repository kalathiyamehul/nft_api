import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { throws } from 'assert';
import { getManager, getRepository, Repository } from 'typeorm';
import { CreateCommentDto, updateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentSchema } from './entities/comment.entity';
import { FCMService } from 'src/fcm-notification/fcm.service';
import { UserSchema } from '../users/entities/user.entity';

@Injectable()
export class CommentService {

  constructor(
    @InjectRepository(CommentSchema) private commentRepository: Repository<CommentSchema>,
    private fcmService: FCMService
  ) { }
  queryManager = getManager();
  userRepository = getRepository(UserSchema);
  async create(createCommentDto: CreateCommentDto, type: string, user_id: number) {
    // const checkCommentQuery = `select * from comment where 
    // type='${type}' and type_id=${createCommentDto?.type_id}
    // and "authorId"=${user_id}`;
    // const checkData = await this.queryManager.query(checkCommentQuery);
    // if (checkData?.length > 0) {
    //   throw new BadRequestException("Comment is Already exists.").getResponse()
    // }
    // else {

    // }

    //Send notification 
    var checkType: string;
    if (type == 'reels')
      checkType = `select * from reels where id=${createCommentDto?.type_id}`
    if (type == 'nfts')
      checkType = `select * from nfts where id=${createCommentDto?.type_id}`
    if (type == 'collections')
      checkType = `select * from collection where id=${createCommentDto?.type_id}`
    if (type == 'posts')
      checkType = `select * from posts where id=${createCommentDto?.type_id}`
    const checkTypedata = await this.queryManager.query(checkType);
    const user = await this.userRepository.findOne({ id: +user_id });
    const noti_data = {
      type: type,
      type_id: createCommentDto?.type_id.toString(),
      user_id: user_id.toString()
    }
    const notification_type = "COMMENT";
    this.fcmService.send(checkTypedata[0]?.authorId, "Horizon", "commented on your " + type, noti_data, user_id, notification_type);

    const inserQuery = `INSERT INTO comment(
	                  type, comment, type_id, "authorId")
	                  VALUES ('${type}',
                       '${createCommentDto?.comment}',${createCommentDto?.type_id}, 
                       ${user_id});`
    await this.queryManager.query(inserQuery)
      .then((res) => {
        let total_comment;
        if (type == 'posts')
          total_comment = `update posts set total_comment=total_comment+1 where id=${createCommentDto?.type_id}`
        else if (type == 'reels')
          total_comment = `update reels set total_comment=total_comment+1 where id=${createCommentDto?.type_id}`
        this.queryManager.query(total_comment);
      })
      .catch((err) => {
        return {
          status: 500,
          message: "Something Went Wrong"
        }
      });
    return {
      status: 200,
      message: "Comment Added"
    }
  }
  async updateComment(createCommentDto: updateCommentDto, comment_id: number,
    user_id: number) {

    const checkCommentQuery = `select * from comment where id='${comment_id}'`;
    const checkData = await this.queryManager.query(checkCommentQuery);
    if (checkData?.length <= 0) {
      throw new BadRequestException("Comment Not Found.").getResponse()
    }
    else {
      const inserQuery = `UPDATE comment
        SET comment='${createCommentDto?.comment}' where id=${comment_id}
        and "authorId"=${user_id} `
      await this.queryManager.query(inserQuery)
        .then((res) => {

        })
        .catch((err) => {
          return {
            status: 500,
            message: "Something Went Wrong"
          }
        });
      return {
        status: 200,
        message: "Comment Updated"
      }
    }
  }
  async deleteComment(comment_id: number) {
    const checkReels = `select * from comment where id = ${comment_id}`;
    const checkReelsData = await this.queryManager.query(checkReels);
    if (checkReelsData?.length <= 0) {
      throw new BadRequestException("Comment Not Found.").getResponse()
    }
    else {
      const inserQuery = `delete from comment where id=${comment_id}`
      await this.queryManager.query(inserQuery)
        .then((res) => {

        })
        .catch((err) => {
          return {
            status: 500,
            message: "Something Went Wrong"
          }
        });
      return {
        status: 200,
        message: "Comment Deleted"
      }
    }
  }
  async getComment(type: string, type_id: number) {
    // const checkCommentQuery = `select * from comment where
    // type='${type}' and type_id=${type_id}`;
    // console.log(checkCommentQuery)
    // const checkData = await this.queryManager.query(checkCommentQuery);
    const user = await this.commentRepository
      .createQueryBuilder("comment")
      .leftJoin('comment.author', 'author')
      .addSelect(['author.id', "author.username", "author.profile_photo"])
      .where(`comment.type_id=:id`, {
        id: type_id,
      }).andWhere(`comment.type=:type`, {
        type: type,
      }).andWhere(`author.status=:status`, {
        status: true,
      })
      .orderBy('comment.created_at', 'DESC')
      .getMany()
    if (!user) {
      throw new BadRequestException("Comment Not Found.").getResponse()
    }
    else {
      return {
        status: 200,
        data: user
      }
    }
  }
}
