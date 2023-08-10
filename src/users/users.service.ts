import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
const shortid = require('shortid');
import { recentSearch, UserSchema } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, getManager, getRepository, Repository } from 'typeorm';
import { CollectionSchema } from 'src/collection/entities/collection.entity';
import { NftSchema } from 'src/nft/entities/nft.entity';
import { createAccountUsingPhoneNo, createAccountUsingWalletAddress } from 'src/auth/dto/create-auth.dto';
import { RecentSearchSchema } from './entities/recent.entity';
import { AddSearchItemDto } from './dto/add-search-item.dto';
import * as bcrypt from 'bcrypt';
import { HashTagsSchema } from 'src/hashtag/entities/hashtag.entity';
import { ReelsSchema, ReelsAudioSchema } from 'src/reels/entities/reel.entity';
import { PostsSchema } from 'src/posts/entities/post.entity';
const referralCodes = require('referral-codes')

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserSchema)
    private userRepository: Repository<UserSchema>,
    @InjectRepository(RecentSearchSchema)
    private recentSearchRepository: Repository<RecentSearchSchema>,
  ) { }

  collectionRepository = getRepository(CollectionSchema);
  nftRepository = getRepository(NftSchema);
  hashtagsRepository = getRepository(HashTagsSchema);
  reelsAudioRepository = getRepository(ReelsAudioSchema);
  reelsReository = getRepository(ReelsSchema);
  postsReository = getRepository(PostsSchema);
  queryManager = getManager();

  async create(createUserDto: CreateUserDto) {
    const user = new UserSchema();
    user.email = createUserDto.email;
    user.username = createUserDto.username;
    user.password = createUserDto.password;
    user.status = true;
    user.python_coin_balance = 0;
    user.total_following = 0;
    user.total_followers = 0;
    user.total_value_of_sell = 0;
    const token = referralCodes.generate({
      length: 10,
      postfix: '2022',
    });
    user.referral_token = token[0];
    if (createUserDto?.latitude) {
      user.latitude = createUserDto?.latitude;
    }
    if (createUserDto?.longitude) {
      user.longitude = createUserDto?.longitude;
    }
    const finaluser = await this.userRepository.save(user).catch((err) => {
      console.log(err);
      return err;
    });
    return finaluser;
  }
  async createUsingPhone(createUserDto: createAccountUsingPhoneNo) {
    const user = new UserSchema();
    if (createUserDto?.referral_token) {
      var query = `select * from users where 
      referral_token='${createUserDto?.referral_token}' limit 1`
      var userIfemail = await this.queryManager.query(query);
      if (userIfemail.length <= 0) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'Referral Token is Not Valid',
        }).getResponse();
      }
      else {
        var queryN;
        if (userIfemail[0].python_coin_balance) {
          queryN = `update users set python_coin_balance=1+python_coin_balance
          where id='${userIfemail[0].id}'`
        }
        else {
          queryN = `update users set python_coin_balance=1
          where id='${userIfemail[0].id}'`
        }
        await this.queryManager.query(queryN);
        user.python_coin_balance = 1;
      }
    }
    user.phone = createUserDto.phone;
    user.country_code = createUserDto.country_code;
    user.password = createUserDto.password;
    user.status = true;
    const token = referralCodes.generate({
      prefix: createUserDto?.phone,
      postfix: '2022',
    });
    user.referral_token = token[0];
    if (createUserDto?.latitude) {
      user.latitude = createUserDto?.latitude;
    }
    if (createUserDto?.longitude) {
      user.longitude = createUserDto?.longitude;
    }
    const finaluser = await this.userRepository.save(user).catch((err) => {
      console.log(err);
      return err;
    });
    return finaluser;
  }
  async createUsingWalletAddress(createUserDto: createAccountUsingWalletAddress) {
    const user = new UserSchema();
    user.walletAddress = createUserDto.walletAddress;
    user.status = true;
    const token = referralCodes.generate({
      prefix: createUserDto?.walletAddress,
      postfix: '2022',
    });
    user.referral_token = token[0];
    if (createUserDto?.latitude) {
      user.latitude = createUserDto?.latitude;
    }
    if (createUserDto?.longitude) {
      user.longitude = createUserDto?.longitude;
    }
    const finaluser = await this.userRepository.save(user).catch((err) => {
      console.log(err);
      return err;
    });
    return finaluser;
  }
  async getUsers() {
    const query = `select * from users  order by 
    total_value_of_sell DESC,total_followers DESC limit 4`;
    const data = await this.queryManager.query(query);
    return data;
  }

  async setDemoData() {
    const DemoReels = require("./../../layers/DemoReels.json");
    const DemoNFTs = require("./../../layers/DemoNft.json");
    const password = await bcrypt.hash("Horizon@123", 10);
    const profileImgs = [
      "https://horizonmobileapp.s3.ap-south-1.amazonaws.com/images/fwkyQcH_y-WhatsApp-Image-2022-08-26-at-1.01.53-PM-%281%29.jpeg",
      "https://horizonmobileapp.s3.ap-south-1.amazonaws.com/images/fRKmxJR9_-WhatsApp-Image-2022-08-26-at-1.01.53-PM-%282%29.jpeg",
      "https://horizonmobileapp.s3.ap-south-1.amazonaws.com/images/K1juNcbNx-WhatsApp-Image-2022-08-26-at-1.01.53-PM-%283%29.jpeg",
      "https://horizonmobileapp.s3.ap-south-1.amazonaws.com/images/n3N3uIAEG-WhatsApp-Image-2022-08-26-at-1.01.53-PM-%284%29.jpeg",
      "https://horizonmobileapp.s3.ap-south-1.amazonaws.com/images/M5xFkG3Eu-WhatsApp-Image-2022-08-26-at-1.01.53-PM-%285%29.jpeg"
    ];
    const userDemoData = [
      {
        "phone": "8200498479",
        "country_code": "+91",
        "email": "parth@gmail.com",
        "username": "Parth_Mangukiya",
        "password": password,
        "profile_photo": profileImgs[Math.floor(Math.random() * profileImgs.length)],
        "latitude": "",
        "longitude": "",
        "referral_token": "",
        "fcm_token": ""
      },
      {
        "phone": "9484999154",
        "country_code": "+91",
        "email": "chirag@horizon.net.in",
        "username": "chirag_pansuriya",
        "password": password,
        "profile_photo": profileImgs[Math.floor(Math.random() * profileImgs.length)],
        "latitude": "",
        "longitude": "",
        "referral_token": "",
        "fcm_token": ""
      },
      {
        "phone": "9328359004",
        "country_code": "+91",
        "email": "umang@gmail.com",
        "username": "Umang_Jinja",
        "password": password,
        "profile_photo": profileImgs[Math.floor(Math.random() * profileImgs.length)],
        "latitude": "",
        "longitude": "",
        "referral_token": "",
        "fcm_token": ""
      },
      {
        "phone": "9586781040",
        "country_code": "+91",
        "email": "zoe@gmail.com",
        "username": "Zoe_hirapara",
        "password": password,
        "profile_photo": profileImgs[Math.floor(Math.random() * profileImgs.length)],
        "latitude": "",
        "longitude": "",
        "referral_token": "",
        "fcm_token": ""
      },
      {
        "phone": "8849149541",
        "country_code": "+91",
        "email": "shivani@gmail.com",
        "username": "Shivani_Desai",
        "password": password,
        "profile_photo": profileImgs[Math.floor(Math.random() * profileImgs.length)],
        "latitude": "",
        "longitude": "",
        "referral_token": "",
        "fcm_token": ""
      },
      {
        "phone": "8866939777",
        "country_code": "+91",
        "email": "arpit@gmail.com",
        "username": "Arpit_Lukhi",
        "password": password,
        "profile_photo": profileImgs[Math.floor(Math.random() * profileImgs.length)],
        "latitude": "",
        "longitude": "",
        "referral_token": "",
        "fcm_token": ""
      },
      {
        "phone": "9426016918",
        "country_code": "+91",
        "email": "mehul@gmail.com",
        "username": "Mehul",
        "password": password,
        "profile_photo": profileImgs[Math.floor(Math.random() * profileImgs.length)],
        "latitude": "",
        "longitude": "",
        "referral_token": "",
        "fcm_token": ""
      },
    ];

    userDemoData.forEach(async (user, index) => {
      // await this.createUsingPhone(user);
    });
    const query = `select id from users`;
    const UserIds = await this.queryManager.query(query);

    const HashtagArray = [
      '#funny', '#funnymemes', '#funnyvideos', '#funnymeme', '#funnypictures', '#funnyvideo', '#funnyposts', '#funnyreels', '#funnyquotes', '#funnymemesdaily', '#funnyface', '#funnyfaces', '#funnyanimals', '#toofunny', '#funnyjokes', '#funnyclips', '#funnytweets', '#funnyday', '#funnystuff', '#funnyvines', '#sofunny',

      '#motivational', '#motivationalquotes', '#motivationalspeaker', '#motivationalquote', '#motivationalmonday', '#motivationalvideos', '#motivationalquotesoftheday', '#motivationalwords', '#motivationalpost', '#motivationalpage', '#hindimotivationalquotes',

      '#education', '#educational', '#educationmatters', '#earlychildhoodeducation', '#haireducation', '#forexeducation', '#financialeducation', '#highereducation', '#arteducation', '#musiceducation', '#educationforall', '#homeeducation', '#specialeducation', '#educationispower', '#educationfirst', '#onlineeducation', '#educationpositive', '#mobilebusinesseducation'
    ];
    DemoReels.forEach(async (reel, index) => {
      var shuffledHashtag = HashtagArray.sort(function () { return .5 - Math.random() });
      var hashtags = shuffledHashtag.slice(0, 3);
      const randomUserid = UserIds[Math.floor(Math.random() * UserIds.length)];
      const user = await this.userRepository.findOne({ id: randomUserid.id })

      // Add Hashtag in Db
      if (hashtags && hashtags.length > 0) {
        hashtags.map(async (hashtag) => {
          const hashtagexist = await this.hashtagsRepository.findOne({ hashtag: hashtag });
          if (!hashtagexist) {
            const inserQuery = `INSERT INTO hashtags(hashtag) VALUES ('${hashtag}');`
            // await this.queryManager.query(inserQuery);
          }
        })
      }
      const reelData = {
        title: "Reels #" + index,
        video_url: reel.url,
        description: "Best reels from Demos",
        video_type: "Good",
        duration: 10,
        thumbnail_url: "",
        hashtags: hashtags,
        author: user
      };
      // const reels = await this.reelsReository.save(reelData);

    })

    DemoNFTs.forEach(async (nft, index) => {
      const randomUserid = UserIds[Math.floor(Math.random() * UserIds.length)];
      const user = await this.userRepository.findOne({ id: randomUserid.id })
      let Create_nft = new NftSchema();
      Create_nft.author = user;
      Create_nft.name = "Creptonium #" + index;
      Create_nft.description = "This is test NFT";
      Create_nft.image_url = nft;
      Create_nft.cryptoCost = '150';
      Create_nft.cryptoType = '';
      Create_nft.service_fee = 5;
      Create_nft.royalties = 1;
      await this.nftRepository.save(Create_nft)

      let Create_post = new PostsSchema();
      Create_post.author = user;
      Create_post.file_url = nft;
      Create_post.description = "This is test NFT";
      Create_post.file_type = "image";
      Create_post.tagged_users = [];
      await this.postsReository.save(Create_post)
    });

  }

  async getSavedNfts(id: number) {
    // const user = await this.userRepository.findOne(id);
    // if (user?.saved_nfts) {
    //   user.saved_nfts = user?.saved_nfts.filter((el) => {
    //     return el !== null && typeof el !== 'undefined' && `${el}` != '';
    //   });
    //   if (user?.saved_nfts?.length <= 0) {
    //     return []
    //   }
    //   const data = await this.queryManager.query(`select * from nfts where id in (${user.saved_nfts.join(',')})`);
    //   return data;
    // }
    // else {
    //   return []
    // }
  }

  async getSavedCollection(id: number) {
    // const user = await this.userRepository.findOne(id);
    // if (user?.saved_collection) {
    //   user.saved_collection = user?.saved_collection.filter((el) => {
    //     return el !== null && typeof el !== 'undefined' && `${el}` != '';
    //   });
    //   if (user?.saved_collection?.length <= 0) {
    //     return []
    //   }
    //   const data = await this.queryManager.query(`select * from collection where id in (${user.saved_collection.join(',')})`);
    //   return data;
    // }
    // else {
    //   return []
    // }
  }
  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto?.preference) {
      updateUserDto.preference = updateUserDto?.preference?.filter(
        (per) => per != 'string',
      );
      if (updateUserDto?.preference?.length <= 0) {
        delete updateUserDto?.preference;
      }
    }
    if (updateUserDto?.reels_category) {
      updateUserDto.reels_category = updateUserDto?.reels_category?.filter(
        (per) => per != 'string',
      );
      if (updateUserDto?.reels_category?.length <= 0) {
        delete updateUserDto?.reels_category;
      }
    }
    if (Object.keys(updateUserDto).length <= 0) {
      return {
        statusCode: 200,
        message: 'Update value required',
      };
    }
    const user = await this.userRepository.findOne(id);
    if (user) {
      await this.userRepository.update(
        { id: id },
        { ...updateUserDto, updated_at: new Date() },
      );
      return {
        statusCode: 200,
        message: 'User Updated',
      };
    } else {
      throw new NotFoundException('User Not found').getResponse();
    }
  }
  async remove(id: number) {
    const user = await this.userRepository.findOne(id);
    if (user) {
      await this.userRepository.remove(user);
      return {
        statusCode: 200,
        message: 'User deleted',
      };
    } else {
      throw new BadRequestException({
        statusCode: 400,
        message: 'User not found',
      }).getResponse();
    }
  }
  async activeUser(id: number) {
    const user = await this.userRepository.findOne(id);
    if (user) {
      await this.userRepository.update(id, { status: true });

      //Manage Comments
      const checkComment = `select * from comment where authorId = ${id}`;
      const checkCommentData = await this.queryManager.query(checkComment);
      if (checkCommentData?.length > 0) {
        checkCommentData.map(async (comment) => {
          let total_comment;
          if (comment?.type == 'posts')
            total_comment = `update posts set total_comment=total_comment+1 where id=${comment?.type_id}`
          else if (comment?.type == 'reels')
            total_comment = `update reels set total_comment=total_comment+1 where id=${comment?.type_id}`
          else if (comment?.type == 'nfts')
            total_comment = `update nfts set total_comment=total_comment+1 where id=${comment?.type_id}`
          else if (comment?.type == 'collections')
            total_comment = `update collections set total_comment=total_comment+1 where id=${comment?.type_id}`;

          await this.queryManager.query(total_comment);
        });
      }

      //Manage Likes
      const checkLike = `select * from likes where authorId = ${id}`;
      const checkLikeData = await this.queryManager.query(checkLike);
      if (checkLikeData?.length > 0) {
        checkLikeData.map(async (like) => {
          let total_like;
          if (like?.type == 'posts')
            total_like = `update posts set total_like=total_like+1 where id=${like?.type_id}`
          else if (like?.type == 'reels')
            total_like = `update reels set total_like=total_like+1 where id=${like?.type_id}`
          else if (like?.type == 'nfts')
            total_like = `update nfts set total_like=total_like+1 where id=${like?.type_id}`
          else if (like?.type == 'collections')
            total_like = `update collections set total_like=total_like+1 where id=${like?.type_id}`;

          await this.queryManager.query(total_like);
        });
      }

      return {
        statusCode: 200,
        message: 'User activated',
      };
    } else {
      throw new BadRequestException({
        statusCode: 400,
        message: 'User not found',
      }).getResponse();
    }
  }
  async deactiveUser(id: number) {
    const user = await this.userRepository.findOne(id);
    if (user) {
      await this.userRepository.update(id, { status: false });

      //Manage Comments
      const checkComment = `select * from comment where authorId = ${id}`;
      const checkCommentData = await this.queryManager.query(checkComment);
      if (checkCommentData?.length > 0) {
        checkCommentData.map(async (comment) => {
          let total_comment;
          if (comment?.type == 'posts')
            total_comment = `update posts set total_comment=total_comment-1 where id=${comment?.type_id}`
          else if (comment?.type == 'reels')
            total_comment = `update reels set total_comment=total_comment-1 where id=${comment?.type_id}`
          else if (comment?.type == 'nfts')
            total_comment = `update nfts set total_comment=total_comment-1 where id=${comment?.type_id}`
          else if (comment?.type == 'collections')
            total_comment = `update collections set total_comment=total_comment-1 where id=${comment?.type_id}`;

          await this.queryManager.query(total_comment);
        });
      }

      //Manage Likes
      const checkLike = `select * from likes where authorId = ${id}`;
      const checkLikeData = await this.queryManager.query(checkLike);
      if (checkLikeData?.length > 0) {
        checkLikeData.map(async (like) => {
          let total_like;
          if (like?.type == 'posts')
            total_like = `update posts set total_like=total_like-1 where id=${like?.type_id}`
          else if (like?.type == 'reels')
            total_like = `update reels set total_like=total_like-1 where id=${like?.type_id}`
          else if (like?.type == 'nfts')
            total_like = `update nfts set total_like=total_like-1 where id=${like?.type_id}`
          else if (like?.type == 'collections')
            total_like = `update collections set total_like=total_like-1 where id=${like?.type_id}`;

          await this.queryManager.query(total_like);
        });
      }

      return {
        statusCode: 200,
        message: 'User deactivated',
      };
    } else {
      throw new BadRequestException({
        statusCode: 400,
        message: 'User not found',
      }).getResponse();
    }
  }
  async getauthor(author_name: string) {
    console.log(author_name);
    const user = await this.userRepository.findOne({
      username: author_name,
    });
    if (user) {
      return user;
    } else {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Author not found',
      }).getResponse();
    }
  }
  async getSearchItem(param, id) {
    let searchQuery = param;
    let data = await this.userRepository
      .createQueryBuilder('users')
      .select([
        'users.id',
        'users.profile_photo',
        'users.username',
        'users.first_name',
        'users.last_name',
      ])
      .where('id <> :id', {
        id: id
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where('first_name ILIKE :searchQuery', {
            searchQuery: `%${searchQuery}%`,
          })
            .orWhere('last_name ILIKE :searchQuery', {
              searchQuery: `%${searchQuery}%`,
            })
            .orWhere('username ILIKE :searchQuery', {
              searchQuery: `%${searchQuery}%`,
            })
            .orWhere('email ILIKE :searchQuery', {
              searchQuery: `%${searchQuery}%`,
            })
        }),
      )
      .getMany();

    return data;
  }
  async getSearchByUsername(param: string, id: number) {
    let searchQuery = param;
    let data = await this.userRepository
      .createQueryBuilder('users')
      .select([
        'users.id',
        'users.profile_photo',
        'users.username',
        'users.first_name',
        'users.last_name',
      ])
      .where('first_name ILIKE :searchQuery', {
        searchQuery: `%${searchQuery}%`,
      })
      .orWhere('last_name ILIKE :searchQuery', {
        searchQuery: `%${searchQuery}%`,
      })
      .orWhere('username ILIKE :searchQuery', {
        searchQuery: `%${searchQuery}%`,
      })
      .orWhere('email ILIKE :searchQuery', {
        searchQuery: `%${searchQuery}%`,
      })
      .getMany();

    return data;
  }
  async getRecentSearches(id: number) {
    var queryN = `select * from users_recentsearch where "autherId"='${id}'`
    const data = await this.queryManager.query(queryN);
    return data;
  }
  async addSearchItem(addSearchItemDto: AddSearchItemDto, user: number) {
    let { user_id } = addSearchItemDto;
    var queryN = `select * from users_recentsearch where user_id='${user_id}' and "autherId"=${user}`;
    const search = await this.queryManager.query(queryN);
    if (search?.length > 0) {
      const data = await this.recentSearchRepository.update({ id: search[0]?.id }, {
        updated_at: new Date()
      });
      return {
        statusCode: 201,
        message: 'Searched item found successfully',
      };
    }
    else {
      // console.log({ ...addSearchItemDto, shortid: shortid.generate() })
      const data = await this.recentSearchRepository.save({
        ...addSearchItemDto, autherId: user, shortid: shortid.generate()
      });
    }
    return {
      statusCode: 201,
      message: 'Searched item added successfully',
    };
  }
  async removeAllSearch(user_id: number) {
    var queryN = `delete from users_recentsearch where "autherId"='${user_id}'`;
    await this.queryManager.query(queryN);
    return {
      statusCode: 201,
      message: 'Searched item removed successfully',
    };
  }
  async removeSearch(id: number) {
    var queryN = `delete from users_recentsearch where id='${id}'`;
    await this.queryManager.query(queryN);
    return {
      statusCode: 201,
      message: 'Searched item removed successfully',
    };
  }
  async findOne(id: number) {
    const user = await this.userRepository
      .createQueryBuilder('users')
      .loadRelationCountAndMap('users.postCount', 'users.posts')
      .loadRelationCountAndMap('users.nftCount', 'users.nfts')
      .loadRelationCountAndMap('users.reelCount', 'users.reels')
      .loadRelationCountAndMap('users.collectionCount', 'users.collections')
      // .leftJoin('users.nfts', 'nfts')
      // .addSelect([
      //   'nfts.id',
      //   'nfts.name',
      //   'nfts.image_url',
      //   'nfts.auction_iscreated',
      //   'nfts.nft_is_minted',
      // ])
      // .leftJoin('users.reels', 'reels')
      // .addSelect(['reels.id', 'reels.title', 'reels.video_url', 'reels.thumbnail_url'])
      // .leftJoin('users.collections', 'collections')
      // .addSelect([
      //   'collections.id',
      //   'collections.collection_name',
      //   'collections.collection_logo_image',
      // ])
      .leftJoin('users.stories', 'stories')
      .addSelect([
        'stories.id',
        'stories.latitude',
        'stories.longitude',
        'stories.image_url',
        'stories.caption',
        'stories.status',
      ])

      .leftJoin('users.illustrations', 'illustrations')
      .addSelect([
        'illustrations.id',
        'illustrations.latitude',
        'illustrations.longitude',
        'illustrations.actual_latitude',
        'illustrations.actual_longitude',
      ])

      .leftJoin('users.futurevisites', 'futurevisites')
      .addSelect([
        'futurevisites.id',
        'futurevisites.latitude',
        'futurevisites.priority',
        'futurevisites.expected_date',
      ])
      .where(`users.id = :id`, {
        id: id,
      })
      .getOne();
    if (user) {
      return {
        statusCode: 200,
        message: 'User found',
        user,
      };
    } else {
      throw new BadRequestException({
        statusCode: 400,
        message: 'User not found',
        user: '',
      }).getResponse();
    }
  }
  async logoutUser(id: number) {
    const user = await this.userRepository.findOne(id);
    if (user) {
      await this.userRepository.update(id, { fcm_token: "" });
      return {
        statusCode: 200,
        message: 'User activated',
      };
    } else {
      throw new BadRequestException({
        statusCode: 400,
        message: 'User not found',
      }).getResponse();
    }
  }
  async getUserList(page = 1) {
    const limit = 10;
    const offset = (page - 1) * limit;
    const query = `select *, (select count(id) from users WHERE is_admin = false AND status = true) AS total_cnt from users WHERE is_admin = false AND status = true order by 
    id DESC OFFSET ${offset} LIMIT ${limit}`;
    const data = await this.queryManager.query(query);
    return data;
  }
}
