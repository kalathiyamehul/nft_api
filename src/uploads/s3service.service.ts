import { Injectable, Req, Res } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import slugify from 'slugify';
import { FileUpload } from './uploads.controller';
import axios from 'axios';
const shortid = require('shortid');
const sharp = require('sharp');
const fs = require('fs').promises;
export interface deleteDto {
  Key: string[];
}

@Injectable()
export class S3Service {
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });
  s3NewTesting = new AWS.S3({
    accessKeyId: "AKIA3EI25N25O7CAARPU",
    secretAccessKey: "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",
    region: process.env.AWS_REGION,
  })
  async uploadFile(file) {
    let { originalname, mimetype } = file;
    mimetype = mimetype ? mimetype : 'image/jpeg';

    return await this.s3_upload(
      file.buffer,
      `${process.env.AWS_S3_BUCKET}/images`,
      `${shortid.generate()}-${(originalname).replaceAll('+', '').replaceAll('#', '')}`,
      mimetype,
    );
  }
  async uploadFileVideo(file, subFolder = "") {
    let { originalname, mimetype } = file;
    mimetype = mimetype ? mimetype : 'image/jpeg';

    return await this.s3_upload(
      file.buffer,
      subFolder === "" ? `${process.env.AWS_S3_BUCKET}/videos` : `${process.env.AWS_S3_BUCKET}/videos/${subFolder}`,
      subFolder === "" ? `${shortid.generate()}-${(originalname).replaceAll('+', '').replaceAll('#', '')}` : `${(originalname)}`,
      mimetype,
    );
  }

  async uploadFiles(files) {
    let response = [];
    for (const file of files) {
      try {
        let fileName = `${shortid.generate()}-${slugify(file.originalname)}`;
        console.log('slugify', slugify(file.originalname));
        const res = await this.s3_upload(
          file.buffer,
          `${process.env.AWS_S3_BUCKET}/${file.mimetype.includes('video') ? 'videos' : 'images'}`,
          fileName,
          file.mimetype,
        );
        response.push(res);
      } catch (err) {
        console.log(err);
      }
    }
    return response;
  }

  async uploadChatFiles(files) {
    let response = [];
    for (const file of files) {
      try {
        let fileName = `${shortid.generate()}-${slugify(file.originalname)}`;
        // console.log('slugify', slugify(file.originalname));
        const res = await this.s3_upload(
          file.buffer,
          `${process.env.AWS_S3_BUCKET}/chat`,
          fileName,
          file.mimetype,
        );
        res['type'] = file.mimetype;
        response.push(res);
      } catch (err) {
        console.log(err);
      }
    }
    return response;
  }

  async s3_upload(file, bucket, name, mimetype) {
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
      ACL: 'public-read',
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: 'ap-south-1',
      },
    };
    try {
      const imgData = await this.s3.upload(params).promise();
      const url = imgData?.Location;
      let imagenotAllowPer = 0;
      try {
        let response = await axios({
          method: 'get',
          url: `http://nsfw.whiteorigin.in:9000/${mimetype.includes("video") ? 'video' : 'image'}?url=${url}`,
        });
        imagenotAllowPer = (response?.data && response?.data > 0) ? response?.data * 100 : 0;
      }
      catch { }
      if (imagenotAllowPer < 80) {
        return { statusCode: 200, Location: imgData?.Location, Key: imgData?.Key, key: imgData?.Key, message: 'File Allowed' }
      }
      else {
        await this.s3_delete({ Key: [imgData?.Key] })
        return { statusCode: 0, Location: "", Key: "", key: "", message: 'File Not Allowed' };
      }
    } catch (e) {
      console.log(e);
    }
  }
  async s3_upload_testing(file, bucket, name, mimetype) {
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
      ACL: 'public-read',
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: 'ap-south-1',
      },
    };
    try {
      const imgData = await this.s3NewTesting.upload(params).promise();
      const url = imgData?.Location;
      let response = await axios({
        method: 'get',
        url: 'http://nsfw.whiteorigin.in:9000/image?url=' + url,
      });
      const imagenotAllowPer = (response?.data && response?.data > 0) ? response?.data * 100 : 0;
      if (imagenotAllowPer < 80) {
        return imgData;
      }
      else {
        await this.s3_delete({ Key: [imgData?.Key] })
        return { statusCode: 0, message: 'File Not Allowed' };
      }
    } catch (e) {
      console.log(e);
    }
  }

  async fileUpload(params) {
    return new Promise((resolve, reject) => {
      (async () => {
        this.s3.upload(params, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      })();
    });
  }

  async s3_delete(params: deleteDto) {
    try {
      let objects = [];
      console.log('params', params);
      if (params) {
        params.Key.forEach((key) => {
          objects.push({ Key: key });
        });

        let options = {
          Bucket: process.env.AWS_S3_BUCKET,
          Delete: {
            Objects: objects,
          },
        };

        try {
          return await this.s3.deleteObjects(options).promise();
        } catch (err) {
          console.log(err);
          return err;
        }
      }
    } catch (err) {
      console.log('err', err);
    }
  }

  // update reels set video_url=REPLACE(thumbnail_url, 'https://horizonmobileapp.s3.ap-south-1.amazonaws.com', 'https://d1psjkwi3jiiy5.cloudfront.net')


  async uploadFilesToS3(files, body: FileUpload) {
    let counter = 0;
    let fileUrls = [];
    for (let i = 0; i < files.length; i++) {
      let params = await this.generateParams(files[i], body);
      const res = await this.s3_upload_testing(
        params.Body,
        body?.bucketname,
        params?.Key,
        params.ContentType,
      );
      fileUrls.push(body?.cdnurl + params.Key);
    }
    return fileUrls;
  }
  async generateFilename(originalName, folder) {
    let fileName = Math.floor(Date.now() * Math.random());
    return `images/${folder}/${fileName}.webp`;
  }
  async generateParams(file: any, body: FileUpload) {
    const fileNamePath = await this.generateFilename(
      file.originalname,
      body?.fileType,
    );
    let splittedfileNamePath = fileNamePath.split('/');
    let fileName = splittedfileNamePath[splittedfileNamePath.length - 1];
    const resizeOptions = {
      fit: 'contain',
      withoutEnlargement: true,
    };
    let compressedFile = sharp(file.buffer);
    if (body?.fileType === 'page' || body?.fileType === 'user') {
      compressedFile.resize(400, 400, resizeOptions); // 400*400
    } else if (body?.fileType === 'auction' || body?.fileType === 'nft') {
      compressedFile.resize(600, 600, resizeOptions); // 100*100
    } else if (body?.fileType === 'story') {
      compressedFile.resize(600, 800, resizeOptions); // 600*800
    }
    await compressedFile.toFile('/tmp/' + fileName);
    let fileBuffer = await fs.readFile('/tmp/' + fileName);
    fs.unlink('/tmp/' + fileName);
    const params = {
      Bucket: body?.bucketname,
      Key: fileNamePath,
      Body: fileBuffer,
      ACL: 'public-read',
      ContentType: 'image/webp',
      CacheControl: 'max-age=172800',
    };
    return params;
  }

}
