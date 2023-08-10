import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { readFileSync, statSync, existsSync, mkdirSync, createWriteStream } from 'fs';
const http = require('https');
import { CreateReelDtoVideo, CreateWatermarkVideoDto } from 'src/reels/dto/create-reel.dto';
import { ReelsService } from 'src/reels/reels.service';
import { Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
const shortid = require('shortid');
const fs = require('fs').promises;
import { S3Service } from './s3service.service';
import path from 'path';
import { getManager } from 'typeorm';
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
@Injectable()
export class UploadsService {
  constructor(
    private s3Service: S3Service,
    private reelsService: ReelsService
  ) { }

  queryManager = getManager();
  findAll() {
    return `This action returns all uploads`;
  }
  async create_reels(attachment, body: CreateReelDtoVideo, id: number) {
    let ssName, videoName, audioName, audio_path, ss_path, video_path;
    var reels, reelsId, reelsAuthor;
    if (!attachment) {
      throw new NotFoundException("Video attachment File Required").getResponse();
    }
    videoName = attachment.filename;
    video_path = process.cwd() + `/HRZ${videoName}`;
    const current_path = process.cwd() + `/${videoName}`;
    var stats = await statSync(current_path)
    var fileSizeInBytes = stats.size;
    const file_size = fileSizeInBytes / (1024 * 1024);
    if (file_size > 1) {
      await this.compress_video(current_path, video_path);// Compress Video
    }
    else {
      video_path = current_path;
    }
    let videoBuffer = await fs.readFile(video_path);
    attachment.buffer = videoBuffer;
    const videoResponse = await this.s3Service.uploadFileVideo(attachment, '360');
    if (!videoResponse) {
      throw new BadRequestException("Error in Video Upload, try Again").getResponse();
    }
    if (videoResponse?.statusCode === 0) {
      fs.unlink(video_path, (err) => { console.log(err) });
      return {
        "message": videoResponse?.message,
        "statusCode": 400,
      };
    }
    if (body?.title) {
      const obj = {
        ...body,
        video_type: attachment?.mimetype,
        video_url: process.env.AWS_CLOUDFRONT_S3_DOMAIN + videoResponse?.Key
      }
      // console.log(obj)
      reels = await this.reelsService.create(obj, id)
      reelsId = +reels?.id;
      reelsAuthor = reels?.author?.username;
      // console.log(reels);
    } else {
      throw new BadRequestException("Tital Is Required").getResponse();
    }

    await ffmpeg({
      source: video_path,
    })
      .on('filenames', (filename) => {
        ssName = filename[0];
      })
      .on('end', async () => {
        // console.log('Job done');
        ss_path = process.cwd() + `/${ssName}`;
        let ssBufferNew = readFileSync(ss_path);
        let ss_attachment = {
          buffer: ssBufferNew,
          mimetype: 'image/jpeg',
          originalname: `${shortid.generate()}.png`,
        };
        const ssResponse = await this.s3Service.uploadFile(ss_attachment);
        // console.log(videoResponse, ssResponse)
        reels = await this.reelsService.update(+reels?.id, {
          thumbnail_url: ssResponse?.Location
        }, id)
        fs.unlink(ss_path, (err) => { console.log(err) });
        // fs.unlink(video_path, (err) => { console.log(err) })
      })
      .on('error', (err) => {
        console.log('Error', err);
        fs.unlink(video_path, (err) => { console.log(err) })
      })
      .takeScreenshots(
        {
          filename: +new Date() + '.png',
          timemarks: [0],
          size: '480x850'
        },
        './',
      );

    //Get Audio file
    if (body?.audio_id > 0) {
      const audioSave = await this.reelsService.getAudio(body?.audio_id);
      const audio = audioSave?.audio;
      reels = await this.reelsService.update(+reels?.id, {
        audio_id: +audio?.id,
        audio_name: audio?.audio_name,
        audio_url: audio?.audio_url,
        audio_duration: audio?.audio_duration,
        audio_thumbnail: audio?.audio_thumbnail,
      }, id);
      // fs.unlink(video_path, (err) => { console.log(err) });
    }
    else {
      audio_path = video_path.substr(0, videoName.lastIndexOf(".")) + ".mp3";
      await new ffmpeg()
        .input(video_path)
        .noVideo()
        .format(`mp3`)
        .outputOptions('-ab', '100k')
        .saveToFile(audio_path)
        .on('end', async () => {
          let audioBufferNew = readFileSync(audio_path);
          let audio_attachment = {
            buffer: audioBufferNew,
            mimetype: 'audio/mpeg',
            originalname: `${shortid.generate()}.mp3`,
          };
          const ssResponse = await this.s3Service.uploadFile(audio_attachment);
          const audioSave = await this.reelsService.addAudio(reelsId, {
            audio_name: reelsAuthor + '_' + body?.title,
            audio_url: ssResponse?.Location,
            audio_duration: body?.duration,
            audio_thumbnail: reels?.author?.profile_photo,
          }, id);
          reels = await this.reelsService.update(reelsId, {
            audio_id: +audioSave?.audio?.id,
            audio_name: reelsAuthor + '_' + body?.title,
            audio_url: ssResponse?.Location,
            audio_duration: body?.duration,
            audio_thumbnail: reels?.author?.profile_photo,
          }, id);
          fs.unlink(audio_path, (err) => { console.log(err) });
          // fs.unlink(video_path, (err) => { console.log(err) })
        })
        .on('error', (err) => {
          console.log('Error', err);
          // fs.unlink(video_path, (err) => { console.log(err) })
        });
    }
    this.quality_video(video_path, videoName)
    return { reels, message: 'Uploaded Sucsessfully' };
  }

  async diff_quality_video(offset, videoName1) {
    const Query = `SELECT * FROM reels ORDER BY id OFFSET ${offset} LIMIT 1`;
    // const Query = `SELECT * FROM posts WHERE file_type = 'video/mp4' ORDER BY id OFFSET ${offset} LIMIT 1`;
    const res = await this.queryManager.query(Query);
    res.map(async (reel) => {
      // await this.quality_video(reel.video_url, reel.id, reel.authorId)
    })

  }


  async quality_video(video_path, fileName) {
    // async quality_video(vp, reelsId, userId) {
    const isSS = false;
    const is144 = true;
    const is360 = false;
    const is720 = true;
    const is1080 = true;

    // const file_Name = vp.substring(vp.lastIndexOf('/') + 1, 0);
    // const fileName = vp.replace(file_Name, '')
    // const video_path = process.cwd() + `/${fileName}`;
    // const videoStream = createWriteStream(fileName);
    // const request = http.get(vp, function (response) {
    //   response.pipe(videoStream);

    //   // after download completed close filestream
    //   videoStream.on("finish", async () => {
    //     videoStream.close();
    //     console.log("Download Completed");
    //   });
    // });
    // setTimeout(async () => {
    if (isSS) {
      let ssName, ss_path, reelsId, userId;
      await ffmpeg({
        source: video_path,
      })
        .on('filenames', (filename) => {
          ssName = filename[0];
        })
        .on('end', async () => {
          // console.log('Job done');
          ss_path = process.cwd() + `/${ssName}`;
          let ssBufferNew = readFileSync(ss_path);
          let ss_attachment = {
            buffer: ssBufferNew,
            mimetype: 'image/jpeg',
            originalname: `${shortid.generate()}.png`,
          };
          const ssResponse = await this.s3Service.uploadFile(ss_attachment);
          // console.log(videoResponse, ssResponse)
          await this.reelsService.update(+reelsId, {
            thumbnail_url: ssResponse?.Location
          }, userId)

          fs.unlink(ss_path, (err) => { console.log(err) });
          fs.unlink(video_path, (err) => { console.log(err) })
          console.log('Done', reelsId);
        })
        .on('error', (err) => {
          console.log('Error', err);
          fs.unlink(video_path, (err) => { console.log(err) })
        })
        .takeScreenshots(
          {
            filename: +new Date() + '.png',
            timemarks: [0],
            size: '480x850'
          },
          './',
        );
    }

    // 144 Video
    if (is144) {
      const vid_144_path = process.cwd() + `/144${fileName}`;
      await new ffmpeg()
        .input(video_path)
        .videoCodec('libx264')
        .fps(30)
        .addOptions(["-crf 28"])
        .size("144x?")
        .aspect(0.562225476)
        .saveToFile(vid_144_path)
        .on('end', async () => {
          let videoBufferNew = readFileSync(vid_144_path);
          let attachment = {
            buffer: videoBufferNew,
            mimetype: 'video/mp4',
            originalname: fileName,
          };
          await this.s3Service.uploadFileVideo(attachment, '144');
          fs.unlink(vid_144_path, (err) => { console.log(err) });
        })
        .on('error', (err) => {
          console.log('Error', err);
        });
    }

    // 360 Video
    if (is360) {
      const vid_360_path = process.cwd() + `/360${fileName}`;
      await new ffmpeg()
        .input(video_path)
        .videoCodec('libx264')
        .fps(30)
        .addOptions(["-crf 28"])
        .size("360x?")
        .aspect(0.562225476)
        .saveToFile(vid_360_path)
        .on('end', async () => {
          let videoBufferNew = readFileSync(vid_360_path);
          let attachment = {
            buffer: videoBufferNew,
            mimetype: 'video/mp4',
            originalname: fileName,
          };
          await this.s3Service.uploadFileVideo(attachment, '360');
          fs.unlink(vid_360_path, (err) => { console.log(err) });
        })
        .on('error', (err) => {
          console.log('Error', err);
        });
    }

    // 720 Video
    if (is720) {
      const vid_720_path = process.cwd() + `/720${fileName}`;
      await new ffmpeg()
        .input(video_path)
        .videoCodec('libx264')
        .fps(30)
        .addOptions(["-crf 28"])
        .size("720x?")
        .aspect(0.562225476)
        .saveToFile(vid_720_path)
        .on('end', async () => {
          let videoBufferNew = readFileSync(vid_720_path);
          let attachment = {
            buffer: videoBufferNew,
            mimetype: 'video/mp4',
            originalname: fileName,
          };
          await this.s3Service.uploadFileVideo(attachment, '720');
          fs.unlink(vid_720_path, (err) => { console.log(err) });
        })
        .on('error', (err) => {
          console.log('Error', err);
        });
    }

    // 1080 Video
    if (is1080) {
      const vid_1080_path = process.cwd() + `/1080${fileName}`;
      await new ffmpeg()
        .input(video_path)
        .videoCodec('libx264')
        .fps(30)
        .addOptions(["-crf 28"])
        .size("1080x?")
        .aspect(0.562225476)
        .saveToFile(vid_1080_path)
        .on('end', async () => {
          let videoBufferNew = readFileSync(vid_1080_path);
          let attachment = {
            buffer: videoBufferNew,
            mimetype: 'video/mp4',
            originalname: fileName,
          };
          const resp = await this.s3Service.uploadFileVideo(attachment, '1080');
          console.log('1080', resp);

          fs.unlink(vid_1080_path, (err) => { console.log(err) });
          fs.unlink(video_path, (err) => { console.log(err) });
        })
        .on('error', (err) => {
          fs.unlink(video_path, (err) => { console.log(err) })
          console.log('Error', err);
        });
    }
    // }, 2000);
  }

  async compress_video(url, output) {
    return new Promise(async (resolve, reject) => {
      await new ffmpeg()
        .input(url)
        .saveToFile(output)
        .videoCodec('libx264')
        // .audioCodec("libmp3lame")
        // .size('360x640')
        .fps(30)
        .addOptions(["-crf 28"])
        // .addOptions("-threads 1")
        // .withFps(30)
        .size("360x?")
        .aspect(0.562225476)
        .on('end', async () => {
          fs.unlink(url, (err) => { console.log(err) });
          return resolve(true);
        })
        .on('error', (err) => {
          console.log('Error', err);
          // return url;
          return reject({
            statusCode: 400,
            error: "Somthing went wrong"
          });

        });
    })
  }

  findOne(id: number) {
    return `This action returns a #${id} upload`;
  }

  remove(id: number) {
    return `This action removes a #${id} upload`;
  }

  // async deleteObject(Key:string) {
  //   const details={
  //     Key,
  //     Bucket: 'theproart'
  //   }
  //   const result=await this.s3Service.s3_delete(details)
  //   console.log('result',result);
  //   return result;
  // }

  async createWatermarkVideo(body: CreateWatermarkVideoDto) {
    let VIDEO_PATH = body?.video_url;
    let AUDIO_PATH = body?.audio_url;
    let AUTHER_NAME = body?.auther_name;
    const filename = path.basename(VIDEO_PATH);
    const fileext = path.extname(VIDEO_PATH);
    const filenameWithoutExt = path.basename(filename, fileext);
    var outputPath = process.cwd() + "/layers/Watermark/data/" + filenameWithoutExt + "_" + new Date().getTime() + fileext;
    var dir = process.cwd() + "/layers/Watermark/data";
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    await this.processVideoSync(VIDEO_PATH, AUDIO_PATH, AUTHER_NAME, outputPath);
    return {
      statusCode: 200,
      data: outputPath
    };
  }

  async processVideoSync(VIDEO_PATH, AUDIO_PATH, AUTHER_NAME, outputPath) {
    return new Promise(async (resolve, reject) => {
      const WATERMARK_PATH = process.cwd() + "/layers/Watermark/watermark.png";
      try {
        if (AUDIO_PATH) {
          await new ffmpeg()
            .input(VIDEO_PATH)
            .input(WATERMARK_PATH)
            .complexFilter([
              //overlay will set possition of logo and drawtext will adjust username under the logo
              "overlay=10:25,drawtext=fontsize=25:fontfile=" + process.cwd() + "/layers/Watermark/VeraMono.ttf:text='@" + AUTHER_NAME + "':x=10:y=200:fontcolor=white:shadowcolor=black:shadowx=1:shadowy=1"
            ])
            .input(AUDIO_PATH) // Add Audio if available
            .inputFormat('mp3')
            // .inputOption('-stream_loop 0') // To set audio in loop
            .on('progress', (progress: { targetSize: string; }) => {
              console.log('Processing: ' + progress.targetSize + ' KB converted');
            })
            .videoCodec('libx264')
            .outputOptions('-pix_fmt yuv420p')
            .saveToFile(outputPath)
            .on('error', function (err, stdout, stderr) {
              return reject({
                statusCode: 400,
                error: "Somthing went wrong"
              });
            })
            .on('end', async () => {
              console.log("END");
              return resolve({
                statusCode: 200,
                data: outputPath
              });
            });
          // return(function resolve(){
          //   return {
          //     statusCode: 200,
          //     data: outputPath
          //   }
          // })


        }
        else {
          await new ffmpeg()
            .input(VIDEO_PATH)
            .input(WATERMARK_PATH)
            .complexFilter([
              //overlay will set possition of logo and drawtext will adjust username under the logo
              "overlay=10:25,drawtext=fontsize=25:fontfile=" + process.cwd() + "/layers/Watermark/VeraMono.ttf:text='@" + AUTHER_NAME + "':x=10:y=200:fontcolor=white:shadowcolor=black:shadowx=1:shadowy=1"
            ])
            .videoCodec('libx264')
            .outputOptions('-pix_fmt yuv420p')
            .saveToFile(outputPath)
            .on('progress', (progress: { targetSize: string; }) => {
              console.log('Processing: ' + progress.targetSize + ' KB converted');
            })
            .on('error', function (err, stdout, stderr) {
              return reject({
                statusCode: 400,
                error: "Somthing went wrong"
              });
            })
            .on('end', () => {
              console.log("END");
              return resolve({
                statusCode: 200,
                data: outputPath
              });
            });
          // return(function resolve(){
          //   return {
          //     statusCode: 200,
          //     data: outputPath
          //   }
          // })

        }
      }
      catch (err) {
        return reject({
          statusCode: 400,
          error: err
        });
      }
    })
  }

  private readonly logger = new Logger(UploadsService.name);

  @Cron('45 * * * *')
  async handleCron() {
    var uploadsDir = process.cwd() + "/layers/Watermark/data";
    if (existsSync(uploadsDir)) {
      const files = await fs.readdir(uploadsDir);
      files.forEach(async (file, index) => {
        const stat = await fs.stat(path.join(uploadsDir, file));
        var endTime, now;
        now = new Date().getTime();
        endTime = new Date(stat.ctime).getTime() + 600000;// Create time + 10 min
        if (now > endTime) {
          this.logger.log("Remove Watermark file of " + file + " @ " + new Date());
          var file_path = path.join(uploadsDir, file);
          fs.unlink(file_path, (err) => { console.log(err) });
        }
      });
    }
    this.logger.debug('Called when the current second is 45 in Watermark remove Cron');
  }

}
