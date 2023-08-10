import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, getRepository, Repository } from 'typeorm';
import { UserSchema } from '../users/entities/user.entity';
import { CreateFollowingDto } from './dto/create-following.dto';
import { FollowsSchema } from './entities/follows.entity';
import { FCMService } from 'src/fcm-notification/fcm.service';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(FollowsSchema)
    private followsRepository: Repository<FollowsSchema>,
    private fcmService: FCMService
  ) { }

  queryManager = getManager()
  userRepository = getRepository(UserSchema);

  async createFollowing(createFollowingDto: CreateFollowingDto, user_id: number) {
    if (+createFollowingDto?.id === +user_id) {
      throw new BadRequestException('Please Provide Diffret Follow Id').getResponse()
    }
    const query = `select * from users where id = ${user_id};`
    var tokenUser = await this.queryManager.query(query);
    const querycreateFollowingDto = `select * from users where id = ${createFollowingDto?.id};`
    var friesdUser = await this.queryManager.query(querycreateFollowingDto);
    if (friesdUser?.length < 0) {
      throw new NotFoundException('Follower User Not Found').getResponse()
    }
    if (tokenUser?.length > 0) {
      const checkBloker = await this.followsRepository.findOne({
        followeeId: createFollowingDto?.id,
        followerId: user_id,
      });
      if (!checkBloker) {
        await this.followsRepository.save({
          followeeId: createFollowingDto?.id,
          followerId: user_id,
        });
        await this.updateFollow(tokenUser, friesdUser, 1);
        // Send Notification
        const notification_type = "FOLLOW";
        const noti_data = {
          followeeId: createFollowingDto?.id.toString(),
          followerId: user_id.toString(),
        }
        //Send notification 
        this.fcmService.send(user_id, "Horizon", `${friesdUser[0]?.username} started following you `, noti_data, +createFollowingDto?.id, notification_type);
        return {
          message: "Follow Succsesfully",
          status: 200
        }
      }
      else {
        return {
          message: "Already Follow",
          status: 200
        }
      }
    }
    else {
      throw new NotFoundException('Restict User Not Found').getResponse()
    }
  }
  async removeFollowing(id: number, user_id: number) {
    if (+id === +user_id) {
      throw new BadRequestException('Please Provide Diffret Follow Id').getResponse()
    }

    const checkBlock = await this.followsRepository.findOne({
      followeeId: +id,
      followerId: +user_id
    });
    if (!checkBlock) {
      throw new NotFoundException('Follow User Not Found').getResponse()
    }
    else {
      const query = `select * from users where id = ${user_id};`
      var tokenUser = await this.queryManager.query(query);
      const querycreateFollowingDto = `select * from users where id = ${id};`
      var friesdUser = await this.queryManager.query(querycreateFollowingDto);
      await this.updateFollow(tokenUser, friesdUser, 2);
      await this.followsRepository.remove(checkBlock);
      return {
        message: "Succsesfully Deleted",
        status: 200
      }
    }
  }
  async removeFollower(friend_id: number, user_id: number) {
    if (+friend_id === +user_id) {
      throw new BadRequestException('Please Provide Diffret Follow Id').getResponse()
    }
    const checkBlock = await this.followsRepository.findOne({
      followerId: +friend_id,
      followeeId: +user_id
    });
    if (!checkBlock) {
      throw new NotFoundException('Follow User Not Found').getResponse()
    }
    else {
      await this.followsRepository.remove(checkBlock);
      const query = `select * from users where id = ${user_id};`
      var tokenUser = await this.queryManager.query(query);
      const querycreateFollowingDto = `select * from users where id = ${friend_id};`
      var friesdUser = await this.queryManager.query(querycreateFollowingDto);
      await this.updateFollow(friesdUser, tokenUser, 2);
      return {
        message: "Succsesfully Deleted",
        status: 200
      }
    }
  }
  async myFollowing(user_id: number) {
    const checkBloker = await this.followsRepository.find({
      followerId: +user_id
    });
    var ids = [];
    if (checkBloker?.length > 0) {
      await checkBloker.map((user) => {
        ids.push(user.followeeId);
      })
      var idsString = ids.join(',')
      const query = `select id,username,profile_photo from users where status = ${true} AND id in(${idsString});`
      var userIfUsername = await this.queryManager.query(query);
      return {
        message: "Fetched Succsesfully",
        status: 200,
        blocks: userIfUsername
      }
    }
    else {
      return {
        message: "Fetched Succsesfully",
        status: 200,
        blocks: []
      }
    }
  }
  async myFollowers(user_id: number) {
    const checkBloker = await this.followsRepository.find({
      followeeId: +user_id
    });
    var ids = [];
    if (checkBloker?.length > 0) {
      await checkBloker.map((user) => {
        ids.push(user.followerId);
      })
      var idsString = ids.join(',')
      const query = `select id,username,profile_photo from users where status = ${true} AND id in(${idsString});`
      var userIfUsername = await this.queryManager.query(query);
      return {
        message: "Fetched Succsesfully",
        status: 200,
        blocks: userIfUsername
      }
    }
    else {
      return {
        message: "Fetched Succsesfully",
        status: 200,
        blocks: []
      }
    }
  }
  async userFollowing(user_id: number, page: number) {
    if (!page) { page = 1 }
    const limit = 20;
    const offset = (page - 1) * limit;

    const checkBloker = await this.followsRepository.find({
      followerId: +user_id
    });
    var ids = [];
    if (checkBloker?.length > 0) {
      await checkBloker.map((user) => {
        ids.push(user.followeeId);
      })
      var idsString = ids.join(',')
      const query = `select id,username,profile_photo from users where status = ${true} AND id in(${idsString})
        OFFSET ${offset}
        LIMIT ${limit};`
      var userIfUsername = await this.queryManager.query(query);
      return {
        message: "Fetched Succsesfully",
        status: 200,
        blocks: userIfUsername
      }
    }
    else {
      return {
        message: "Fetched Succsesfully",
        status: 200,
        blocks: []
      }
    }
  }
  async userFollowers(user_id: number, page: number) {
    if (!page) { page = 1 }
    const limit = 20;
    const offset = (page - 1) * limit;

    const checkBloker = await this.followsRepository.find({
      followeeId: +user_id
    });
    var ids = [];
    if (checkBloker?.length > 0) {
      await checkBloker.map((user) => {
        ids.push(user.followerId);
      })
      var idsString = ids.join(',')
      const query = `select id,username,profile_photo from users where status = ${true} AND id in(${idsString})
        OFFSET ${offset}
        LIMIT ${limit};`
      var userIfUsername = await this.queryManager.query(query);
      return {
        message: "Fetched Succsesfully",
        status: 200,
        blocks: userIfUsername
      }
    }
    else {
      return {
        message: "Fetched Succsesfully",
        status: 200,
        blocks: []
      }
    }
  }
  async getUser(user_id: number) {
    const query = `select * from users where id = ${user_id};`
    var userIfUsername = await this.queryManager.query(query);
    if (userIfUsername?.length > 0)
      return true;
    return false;
  }
  async updateFollow(tokenUser, friesdUser, flag) {
    var queryN;
    if (flag == 1) {
      queryN = `update users set total_following=1+total_following
          where id='${tokenUser[0].id}';
          update users set total_followers=1+total_followers
          where id='${friesdUser[0].id}';
          `
      // console.log(queryN)
    }
    else {
      queryN = `update users set total_following=total_following-1
          where id='${tokenUser[0].id}';
          update users set total_followers=total_followers-1
          where id='${friesdUser[0].id}';
          `
      // console.log(queryN)
    }
    await this.queryManager.query(queryN);
  }

}
