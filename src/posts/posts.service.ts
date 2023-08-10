import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSchema } from 'src/users/entities/user.entity';
import { getManager, getRepository, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { PostHideSchema, PostsSchema } from './entities/post.entity';
import { FCMService } from 'src/fcm-notification/fcm.service';
import { FollowsSchema } from 'src/follows/entities/follows.entity';
import { S3Service } from './../uploads/s3service.service';

import { readFileSync } from 'fs';
const http = require('https'); // or 'https' for https:// URLs
const { createWriteStream } = require('fs');
const shortid = require('shortid');
const fs = require('fs').promises;
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

@Injectable()
export class PostsService {

  constructor(
    @InjectRepository(PostsSchema)
    private postsReository: Repository<PostsSchema>,
    private fcmService: FCMService,
    private s3Service: S3Service
  ) { }
  queryManager = getManager();
  userRepository = getRepository(UserSchema);
  postHideRepository = getRepository(PostHideSchema);
  followsRepository = getRepository(FollowsSchema);

  //Create New Post
  async create(createPostDto: CreatePostDto, id: number) {
    const user = await this.userRepository.findOne({ id: id })
    const posts = await this.postsReository.save({
      ...createPostDto,
      author: user
    });
    delete posts?.author;

    //Add Thumbnail
    this.addThumbUrl(posts.file_url, posts.id, id);

    //Send notification to close friends
    const checkBloker = await this.followsRepository.find({ followerId: +id });
    if (checkBloker?.length > 0) {
      const notification_type = "CREATE_POST";
      const noti_data = {
        postId: posts.id.toString(),
        msg_type: posts.file_type,
        file: posts?.file_url
      }
      await checkBloker.map((closeuser) => {
        this.fcmService.send(+closeuser.followeeId, "Horizon", "present a Speire", noti_data, id, notification_type);
      })
    }
    //-----------------------------------
    return posts;
  }

  async add_thumbnail(offset) {
    const Query = `SELECT * FROM posts WHERE file_type = 'video/mp4' ORDER BY id OFFSET ${offset} LIMIT 1`;
    const res = await this.queryManager.query(Query);
    res.map(async (post) => {
      await this.addThumbUrl(post.file_url, post.id, post.authorId)
    })
  }

  async addThumbUrl(videoName, post_id, user_id) {
    const video_path = `${new Date().getTime()}.mp4`;
    const file = createWriteStream(video_path);
    await http.get(videoName, function (response) {
      response.pipe(file);
      // after download completed close filestream
      file.on("finish", async () => {
        file.close();
        console.log("Download Completed");
      });
    });
    setTimeout(async () => {
      let ssName = '', ss_path = '';
      await ffmpeg({
        source: video_path,
      })
        .on('filenames', (filename) => {
          ssName = filename[0];
        })
        .on('end', async () => {
          ss_path = process.cwd() + `/${ssName}`;
          let ssBufferNew = readFileSync(ss_path);
          let ss_attachment = {
            buffer: ssBufferNew,
            mimetype: 'image/jpeg',
            originalname: `${shortid.generate()}.png`,
          };
          const ssResponse = await this.s3Service.uploadFile(ss_attachment);
          fs.unlink(ss_path, (err) => { console.log(err) });
          console.log("SS Generated");
          await this.update(+post_id, {
            thumbnail_url: ssResponse?.Location
          }, user_id)
        })
        .on('error', (err) => {
          console.log('Error', err);
        })
        .takeScreenshots(
          {
            filename: +new Date() + '.png',
            timemarks: [0],
            size: '640x360'
          },
          './',
        );
    }, 2000);
  }

  // Get all Posts
  async getPostsByAuthorID(page: number, user_id: number) {
    if (!page) { page = 1 }
    const limit = +process.env?.POST_LIMIT;
    const offset = (page - 1) * limit;
    const Query = `SELECT posts.*, users.username AS author_username, users.profile_photo AS author_profile_photo,
      false AS is_follow, false AS is_liked, false AS is_favotite_user
      FROM posts
      LEFT JOIN users ON users.id = "authorId"
      WHERE "authorId"= ${user_id}
      ORDER BY id
      OFFSET ${offset}
      LIMIT ${limit}`
    const posts = await this.queryManager.query(Query);
    return posts;
  }

  // Get Tranding Posts
  // AND "authorId" <> ${user_id}
  async getTrandingPosts(page: number, user_id: number) {
    if (!page) { page = 1 }
    const limit = +process.env?.POST_LIMIT;
    const offset = (page - 1) * limit;
    const Query = `SELECT posts.*, users.username AS author_username, users.profile_photo AS author_profile_photo,
      CASE WHEN (SELECT id FROM public.follows_users where "followerId" = ${user_id} and "followeeId" = "authorId") > 0 THEN true ELSE false END AS is_follow,
      CASE WHEN (SELECT id FROM public.likes WHERE type='posts' AND "authorId" = ${user_id} AND type_id = posts.id) > 0 THEN true ELSE false END AS is_liked,
      CASE WHEN (SELECT id FROM public.favorite_user WHERE LOWER(request_from)='posts' AND "authorId" = ${user_id} AND user_id = "authorId") > 0 THEN true ELSE false END AS is_favotite_user,
      CASE WHEN (SELECT id FROM public.content_collection WHERE LOWER(type)='posts' AND "authorId" = ${user_id} AND type_id = posts.id) > 0 THEN true ELSE false END AS is_in_collection
      FROM posts
      LEFT JOIN users ON users.id = "authorId"
      WHERE posts.id NOT IN (SELECT type_id FROM post_hide hide WHERE hide.type = 'posts' AND "authorId"= ${user_id}) 
      AND users.status = ${true}
      AND (
        posts."postVisibility" = 'everyone' 
        OR 
        ${user_id} IN (SELECT "followeeId" FROM public.follows_users where "followerId" = "authorId") 
      )
      ORDER BY id DESC
      OFFSET ${offset}
      LIMIT ${limit}`
    const posts = await this.queryManager.query(Query);
    return posts;
  }

  // Get Perticuler Post
  async getPostsById(id: string, user_id: number) {
    // const posts = await this.postsReository
    //   .createQueryBuilder("posts")
    //   .leftJoin('posts.author', 'author')
    //   .addSelect(['author.id', "author.username", "author.profile_photo"])
    //   .where(`posts.id=:id`, { id: +id })
    //   .getOne();
    const Query = `SELECT posts.*, users.username AS author_username, users.profile_photo AS author_profile_photo,
      CASE WHEN (SELECT id FROM public.follows_users where "followerId" = ${user_id} and "followeeId" = "authorId") > 0 THEN true ELSE false END AS is_follow,
      CASE WHEN (SELECT id FROM public.likes WHERE type='posts' AND "authorId" = ${user_id} AND type_id = posts.id) > 0 THEN true ELSE false END AS is_liked,
      CASE WHEN (SELECT id FROM public.favorite_user WHERE LOWER(request_from)='posts' AND "authorId" = ${user_id} AND user_id = "authorId") > 0 THEN true ELSE false END AS is_favotite_user,
      CASE WHEN (SELECT id FROM public.content_collection WHERE LOWER(type)='posts' AND "authorId" = ${user_id} AND type_id = posts.id) > 0 THEN true ELSE false END AS is_in_collection
      FROM posts
      LEFT JOIN users ON users.id = "authorId"
      WHERE posts.id = '${id}'`
    const posts = await this.queryManager.query(Query);
    return posts;
  }

  // Update Post
  async update(id: number, updatePostDto: any, user_id: number) {
    const user = await this.userRepository.findOne({ id: user_id })
    const post = await this.postsReository.findOne({ id: id, author: user })
    if (post) {
      await this.postsReository.update({ id: id }, { ...updatePostDto });
      return {
        message: "Succsesfully Updated.",
        status: 200
      };
    }
    else {
      return new NotFoundException('Posts Not Found');
    }
  }

  // Delete Post
  async remove(id: number, user_id: number) {
    const user = await this.userRepository.findOne({ id: user_id })
    const post = await this.postsReository.findOne({ id: id, author: user })
    if (post) {
      await this.postsReository.remove(post);
      return {
        message: "Succsesfully Deleted.",
        status: 200
      };
    }
    else {
      return new NotFoundException('Posts Not Found');
    }
  }

  // Hide Post
  async hidePost(type: string, type_id: number, user_id: number) {
    var checkType;
    if (type == 'posts')
      checkType = `select * from posts where id=${type_id}`
    const checkTypedata = await this.queryManager.query(checkType)
    if (checkTypedata?.length <= 0) {
      return {
        data: false,
        message: `${type} Not Found`
      }
    }
    const checkfavoriteQuery = `select * from post_hide where type='${type}' and type_id=${type_id} and "authorId"=${user_id}`;
    const checkData = await this.queryManager.query(checkfavoriteQuery);
    if (checkData?.length > 0) {
      const inserQuery = `DELETE FROM public.post_hide
        WHERE type='${type}' and type_id=${type_id} and "authorId"=${user_id};`
      await this.queryManager.query(inserQuery)
        .then(async (res) => { })
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
        message: "Post Unhide"
      }
    }
    else {
      const inserQuery = `INSERT INTO post_hide(type, type_id, "authorId") 
                    VALUES ('${type}' ,${type_id}, ${user_id});`
      await this.queryManager.query(inserQuery)
        .then((res) => {
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
        message: "Post Hide"
      }
    }
  }
}
