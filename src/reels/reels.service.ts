import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSchema } from 'src/users/entities/user.entity';
import { getManager, getRepository, Repository } from 'typeorm';
import { CreateReelDto, WatchReelDto } from './dto/create-reel.dto';
import { UpdateReelDto } from './dto/update-reel.dto';
import { ReelsSchema, WatchReelsSchema, ReelsAudioSchema } from './entities/reel.entity';
import { FCMService } from 'src/fcm-notification/fcm.service';
import { CloseFriendSchema } from 'src/closefriend/entities/closefriend.entity';
import { HashTagsSchema } from 'src/hashtag/entities/hashtag.entity';

@Injectable()
export class ReelsService {

  constructor(@InjectRepository(ReelsSchema) private reelsReository: Repository<ReelsSchema>,
    private fcmService: FCMService
  ) { }
  queryManager = getManager();
  userRepository = getRepository(UserSchema);
  closeFriendRepository = getRepository(CloseFriendSchema);
  watchReelsRepository = getRepository(WatchReelsSchema);
  hashtagsRepository = getRepository(HashTagsSchema);
  reelsAudioRepository = getRepository(ReelsAudioSchema);

  async create(createReelDto: CreateReelDto, id: number) {
    const user = await this.userRepository.findOne({ id: id })
    const hashtags = createReelDto.description.match(/#[a-z_]+/gi);

    // Add Hashtag in Db
    if (hashtags && hashtags.length > 0) {
      hashtags.map(async (hashtag) => {
        const hashtagexist = await this.hashtagsRepository.findOne({ hashtag: hashtag });
        if (!hashtagexist) {
          const inserQuery = `INSERT INTO hashtags(hashtag) VALUES ('${hashtag}');`
          await this.queryManager.query(inserQuery);
        }
      })
    }
    const reels = await this.reelsReository.save({
      ...createReelDto,
      hashtags: hashtags,
      author: user
    });
    // delete reels?.author;

    //Send notification to close friends
    const checkBloker = await this.closeFriendRepository.find({ userID: +id });
    if (checkBloker?.length > 0) {
      const notification_type = "CREATE_REEL";
      const noti_data = {
        reelsId: reels.id
      }
      await checkBloker.map((closeuser) => {
        this.fcmService.send(+closeuser.closefriendID, "Horizon", "create a new Limelight", noti_data, id, notification_type);
      })
    }
    //-----------------------------------
    return reels;;
  }

  async getReelsByAuthorID(page: number, user_id: number) {
    if (!page || Number.isNaN(page) || page == 0) { page = 1 }
    const limit = +process.env?.REELS_LIMIT;
    const offset = (page - 1) * limit;
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
      WHERE reels."authorId" = ${user_id}
        OFFSET ${offset}
        LIMIT ${limit}`;
    const reels = await this.queryManager.query(Query);
    return reels;
  }

  getLanguageAndCategory() {
    return [{
      "language": [
        { "name": "English", "key": "ENGLISH" },
        { "name": "ગુજરાતી", "key": "GUJARATI" },
        { "name": "हिन्दी", "key": "HINDI" },
        { "name": "ਪੰਜਾਬੀ", "key": "PUNJABI" },
        { "name": "मराठी", "key": "MARATHI" },
        { "name": "മലയാളം", "key": "MALAYALAM" },
        { "name": "ಕನ್ನಡ", "key": "KANNADA" },
        { "name": "తెలుగు", "key": "TELUGU" },
        { "name": "தமிழ்", "key": "TAMIL" },
        { "name": "ESPAÑOL", "key": "SPANISH" },
        { "name": "ITALIANO", "key": "ITALIAN" },
        { "name": "FRANÇAISE", "key": "FRANCH" },
        { "name": "РУССКИЙ", "key": "RUSSIAN" },
        { "name": "BAHASA", "key": "INDONESIAN" },
        { "name": "عربى", "key": "ARABIC" },
      ],
      "categories": [
        { "name": "Funny", "key": "FUNNY" },
        { "name": "Friendship", "key": "FRIENDSHIP" },
        { "name": "Romantic", "key": "ROMANTIC" },
        { "name": "Motivation", "key": "MOTIVATION" },
        { "name": "Attitude", "key": "ATTITUDE" },
        { "name": "Learning", "key": "LEARNING" },
        { "name": "Tech", "key": "TECHNOLOGY" },
        { "name": "Education", "key": "EDUCATION" },
        { "name": "Sad", "key": "SAD" },
        { "name": "Sport", "key": "SPORT" },
        { "name": "Adventure", "key": "ADVENTURE" },
        { "name": "Dialog", "key": "DIALOG" },
      ]
    }];
  }

  async getTrandingReels(page: number, user_id: number, firstReel: number) {
    if (!page) { page = 1 }
    const limit = (firstReel > 0) ? +process.env?.REELS_LIMIT - 1 : +process.env?.REELS_LIMIT;
    const rendom = 5;
    const offset = ((page - 1) * limit) - ((page - 1) * rendom);
    const user = await this.userRepository.findOne({ id: user_id })
    var regex = new RegExp(",", "g");
    let firstreels = [];

    // If requested for fix first reel
    if (firstReel > 0) {
      const FirstQuery = `select reels.*, users.username AS author_username, users.profile_photo AS author_profile_photo,
      CASE WHEN (SELECT id FROM public.follows_users where "followerId" = ${user_id} and "followeeId" = reels."authorId") > 0 THEN true ELSE false END AS is_follow,
      CASE WHEN (SELECT id FROM public.likes WHERE type='reels' AND "authorId" = ${user_id} AND type_id = reels.id) > 0 THEN true ELSE false END AS is_liked,
      CASE WHEN (SELECT id FROM public.favorite_user WHERE LOWER(request_from)='reels' AND "authorId" = ${user_id} AND user_id = reels."authorId") > 0 THEN true ELSE false END AS is_favotite_user,
      CASE WHEN (SELECT id FROM public.content_collection WHERE LOWER(type)='reels' AND "authorId" = ${user_id} AND type_id = reels.id) > 0 THEN true ELSE false END AS is_in_collection
      from reels
      LEFT JOIN users ON users.id = "authorId"
      LEFT JOIN reels_like likes on likes.hashtag in (reels.hashtags) AND likes."authorId" = ${user_id}
      LEFT JOIN favorite_user favorite on favorite.user_id = reels."authorId" AND favorite."authorId" = ${user_id}
      LEFT JOIN reels_order ON reels_order.category = reels.category AND reels_order."authorId" = ${user_id}
      WHERE reels.id = ${firstReel}`
      firstreels = await this.queryManager.query(FirstQuery);
    }

    //AND reels."authorId" <> ${user_id}
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
    WHERE reels.id NOT IN (select report.type_id from content_report report where report.type='reels' and report."authorId" = ${user_id})
    AND users.status = ${true}
    ${(user && user.language) ? " AND reels.language LIKE '" + user.language + "'" : ''}
    ${(user && user.reels_category) ? " AND reels.category IN ('" + user.reels_category.join(',').replace(regex, "','") + "')" : ''}
    group by reels.id, users.id, favorite.id, reels_order.sr_no
    order by coalesce(max(likes.cnt),0) DESC, CASE WHEN (favorite.id > 0) THEN 1 ELSE 0 END DESC, coalesce(reels_order.sr_no,0) DESC, RANDOM()
      OFFSET ${offset}
      LIMIT ${limit - rendom}`
    const reels = await this.queryManager.query(Query);
    const requireData = limit - rendom;
    const extraData = requireData - reels.length;

    const Query2 = `SELECT reels.*, users.username AS author_username, users.profile_photo AS author_profile_photo,
      CASE WHEN (SELECT id FROM public.follows_users where "followerId" = ${user_id} and "followeeId" = reels."authorId") > 0 THEN true ELSE false END AS is_follow,
      CASE WHEN (SELECT id FROM public.likes WHERE type='reels' AND "authorId" = ${user_id} AND type_id = reels.id) > 0 THEN true ELSE false END AS is_liked,
      CASE WHEN (SELECT id FROM public.favorite_user WHERE LOWER(request_from)='reels' AND "authorId" = ${user_id} AND user_id = reels."authorId") > 0 THEN true ELSE false END AS is_favotite_user,
      CASE WHEN (SELECT id FROM public.content_collection WHERE LOWER(type)='reels' AND "authorId" = ${user_id} AND type_id = reels.id) > 0 THEN true ELSE false END AS is_in_collection
      FROM reels
      LEFT JOIN users ON users.id = "authorId"
      WHERE reels.id NOT IN (select report.type_id from content_report report where report.type='reels' and report."authorId" = ${user_id})
      AND users.status = ${true}
      ORDER BY RANDOM()
      LIMIT ${(reels.length < requireData) ? (rendom + extraData) : rendom}`
    const reels2 = await this.queryManager.query(Query2);
    const otherreel = reels.concat(reels2).sort(() => Math.random() - 0.5);
    return firstreels.concat(otherreel);
  }
  async getReelsById(id: string) {
    const reels = await this.reelsReository
      .createQueryBuilder("reels")
      .leftJoin('reels.author', 'author')
      .addSelect(['author.id', "author.username", "author.profile_photo"])
      .where(`reels.id=:id`, {
        id: +id,
      })
      .getOne();
    return reels;
  }

  async update(id: number, updateReelDto: any, user_id: number) {
    const user = await this.userRepository.findOne({ id: user_id })
    const reel = await this.reelsReository.findOne({ id: id, author: user })
    if (reel) {
      await this.reelsReository.update({ id: id }, { ...updateReelDto });
      return {
        message: "Succsesfully Updated.",
        status: 200
      };
    }
    else {
      return new NotFoundException('Reels Not Found');
    }
  }

  async addAudio(id: number, reelAudioDto: any, user_id: number) {
    const user = await this.userRepository.findOne({ id: user_id })
    const reel = await this.reelsReository.findOne({ id: id })
    const audio = await this.reelsAudioRepository.save({
      ...reelAudioDto,
      author: user,
      reel: reel
    });
    return {
      message: "Succsesfully saved.",
      status: 200,
      audio: audio
    };
  }

  async getAudio(id: number) {
    const audio = await this.reelsAudioRepository.findOne({ id: id })
    return {
      message: "Succsesfully saved.",
      status: 200,
      audio: audio
    };
  }

  async getAudioList(search: string) {
    const audio = await this.reelsAudioRepository
      .createQueryBuilder("audio")
      .where("LOWER(audio.audio_name) like LOWER(:search)", { search: `%${search}%` })
      .getMany();
    return {
      message: "Succsesfully saved.",
      status: 200,
      audio: audio
    };
  }

  async remove(id: number, user_id: number) {
    const user = await this.userRepository.findOne({ id: user_id })
    const reel = await this.reelsReository.findOne({ id: id, author: user })
    if (reel) {
      await this.reelsReository.remove(reel);
      return {
        message: "Succsesfully Deleted.",
        status: 200
      };
    }
    else {
      return new NotFoundException('Reels Not Found');
    }

  }

  async watch(watchReelDto: WatchReelDto, user_id: number) {
    const user = await this.userRepository.findOne({ id: user_id })
    const reel = await this.reelsReository.findOne({ id: watchReelDto.reel_id })
    if (reel) {
      const watchper = ((100 * watchReelDto.watch_duration) / reel.duration).toFixed(2);
      const existwatchedreel = await this.watchReelsRepository.findOne({ author: user, reel: reel });

      if (existwatchedreel) {
        if (+watchper > existwatchedreel.watch_per) {
          existwatchedreel.watch_duration = watchReelDto.watch_duration;
          existwatchedreel.watch_per = +watchper;
        }
        existwatchedreel.watch_cnt = existwatchedreel.watch_cnt + 1;
        await this.watchReelsRepository.save(existwatchedreel);
        return {
          message: "Succsesfully updated.",
          status: 200
        };
      }
      else {
        await this.watchReelsRepository.save({ ...watchReelDto, reel: reel, author: user, reel_duration: +reel.duration, watch_per: +watchper, watch_cnt: 1 });
        return {
          message: "Succsesfully added.",
          status: 200
        };
      }
    }
    else {
      return new NotFoundException('Reels Not Found');
    }
  }
}
