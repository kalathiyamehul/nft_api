import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSchema } from 'src/users/entities/user.entity';
import { getManager, getRepository, Repository } from 'typeorm';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { StorySchema } from './entities/story.entity';
import { Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FCMService } from 'src/fcm-notification/fcm.service';
import { CloseFriendSchema } from 'src/closefriend/entities/closefriend.entity';

@ApiTags('Locarnoa')
@Injectable()
export class StoryService {
  constructor(
    @InjectRepository(StorySchema) private storiesRepository: Repository<StorySchema>,
    private fcmService: FCMService
  ) { }
  userRepository = getRepository(UserSchema);
  closeFriendRepository = getRepository(CloseFriendSchema);

  async create(createStoryDto: CreateStoryDto, id: number) {
    const user = await this.userRepository.findOne({ id: id });
    const story = await this.storiesRepository.save({
      author: user,
      ...createStoryDto
    })
    delete story?.author;

    //Send notification 
    const closeFriends = await this.closeFriendRepository.find({
      closefriendID: +id
    });
    if (closeFriends?.length > 0) {
      await closeFriends.map((frienduser) => {
        const noti_data = {
          storyId: story.id.toString(),
          user_id: id.toString()
        }
        const notification_type = "STORY_ADD";
        this.fcmService.send(+frienduser.userID, "Horizon", "recently added new story.", noti_data, +id, notification_type);
      })
    }
    return story;
  }

  async findAll(user_id: number) {
    const story = await this.storiesRepository
      .createQueryBuilder('stories')
      .leftJoin('stories.author', 'author')
      .addSelect(['author.username', "author.id", "author.profile_photo"])
      .where(`stories.status = :status`, {
        status: 'Active',
      })
      // .andWhere(`stories."authorId" <> ${user_id}`)
      .getMany();
    return story;
  }

  async update(id: number, updateStoryDto: UpdateStoryDto, user_id: number) {

    const story = await this.storiesRepository.find({ id: id });
    if (story.length > 0) {
      const story = await this.storiesRepository.update({ id: id }, {
        ...updateStoryDto
      })
      return {
        message: "Succsesfully Updated",
        status: 200,
      }
    }
    else {
      throw new NotFoundException('Story Not Found').getResponse()
    }

  }
  queryManager = getManager()

  async remove(id: number) {

    const story = await this.storiesRepository.find({ id: id });
    if (story.length > 0) {
      await this.storiesRepository.remove(story);
      return {
        message: "Succsesfully Deleted",
        status: 200
      }
    }
    else {
      throw new NotFoundException('Story Not Found').getResponse()
    }
  }

  private readonly logger = new Logger(StoryService.name);

  @Cron('0 * * * *')
  async handleCron() {
    const query = `SELECT  * FROM stories WHERE  
    "created_at" BETWEEN NOW() - INTERVAL '25 HOURS' AND NOW() and 
    status='Active' ;`
    var userIfUsername = await this.queryManager.query(query);
    userIfUsername.map(async (story: any) => {
      let diffInMilliSeconds = Math.abs(new Date().getTime() -
        new Date(story.created_at).getTime()) / 1000;

      // calculate days
      const days = Math.floor(diffInMilliSeconds / 86400);
      diffInMilliSeconds -= days * 86400;
      console.log('calculated days', days);

      // calculate hours
      const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
      diffInMilliSeconds -= hours * 3600;
      console.log('calculated hours', hours);

      if (days == 1 || hours >= 23) {
        await this.storiesRepository.update({ id: story?.id }, {
          status: 'Archived'
        })
        this.logger.log("Story Updtaed ", story?.id)
      }

    })
    this.logger.debug('Called when the current second is 45');
  }

  async statusUpdate(id: number, updateStoryDto: UpdateStoryDto) {
    const story = await this.storiesRepository.find({ id: id });
    if (story.length > 0) {
      await this.storiesRepository.update({ id: id }, { status: updateStoryDto?.status });
      return {
        message: "Succsesfully Updated",
        status: 200
      }
    }
    else {
      throw new NotFoundException('Story Not Found').getResponse()
    }
  }
}
