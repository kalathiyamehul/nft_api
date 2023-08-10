import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSchema } from 'src/users/entities/user.entity';
import { getManager, getRepository, Repository } from 'typeorm';
import { CloseFriendSchema } from './entities/closefriend.entity';
import { FCMService } from 'src/fcm-notification/fcm.service';

@Injectable()
export class ClosefriendService {
  constructor(
    @InjectRepository(CloseFriendSchema)
    private closeFriendRepository: Repository<CloseFriendSchema>,
    private fcmService: FCMService
  ) { }
  queryManager = getManager();

  userRepository = getRepository(UserSchema);
  async addIntoCloseFriend(closefriendID: number, user_id: number) {
    if (+closefriendID === +user_id) {
      throw new BadRequestException('Please Provide Diffret CloseFriend Id').getResponse()
    }

    if (await this.getUser(+closefriendID)) {
      const finalFollowCheck = await this.closeFriendRepository
        .findOne({
          closefriendID: closefriendID,
          userID: user_id
        })
        .catch((err) => {
          console.log(err);
          return err;
        });
      if (finalFollowCheck) {
        throw new BadRequestException('Already Close Friend.')
      }
      const finalFollow = await this.closeFriendRepository
        .save({
          closefriendID: closefriendID,
          userID: user_id
        })
        .catch((err) => {
          console.log(err);
          return err;
        });

      //Send notification 
      const user = await this.userRepository.findOne({ id: +user_id });
      const noti_data = {
        closefriendID: closefriendID,
        user_id: user_id.toString()
      }
      const notification_type = "CLOSE_FRIEND";
      this.fcmService.send(+closefriendID, "Horizon","Added you as close friend", noti_data, user_id, notification_type);  
      return {
        statusCode: 200,
        data: finalFollow,
        message: 'Added to CloseFriend',
      };
    } else {
      throw new NotFoundException('CloseFriend User Not Found').getResponse()
    }
    

  }
  async removeFromCloseFriend(closefriendID: number, user_id: number) {
    if (+closefriendID === +user_id) {
      throw new BadRequestException('Please Provide Diffret CloseFriend Id').getResponse()
    }
    const finalFollow = await this.closeFriendRepository
      .findOne({
        closefriendID: closefriendID,
        userID: user_id
      })
      .catch((err) => {
        console.log(err);
        return err;
      });
    if (finalFollow) {
      await this.closeFriendRepository.remove(finalFollow);
      return {
        statusCode: 200,
        message: 'Remove from CloseFriend',
      };
    }
    else {
      return {
        statusCode: 200,
        message: 'User is Not Close Friend',
      };
    }

  }

  async closeFriendList(user_id: number) {
    const checkBloker = await this.closeFriendRepository.find({
      userID: +user_id
    });
    var ids = [];
    if (checkBloker?.length > 0) {
      await checkBloker.map((user) => {
        ids.push(user.closefriendID);
      })
      var idsString = ids.join(',')
      const query = `select id,username,profile_photo from users where id in(${idsString});`
      var userIfUsername = await this.queryManager.query(query);
      return {
        message: "Fetched Succsesfully",
        status: 200,
        closes: userIfUsername,
        closeFriends: ids
      }
    }
    else {
      return {
        message: "Fetched Succsesfully",
        status: 200,
        closes: [],
        closeFriends: []
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
}
