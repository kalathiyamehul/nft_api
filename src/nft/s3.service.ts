import { Injectable, Req, Res } from '@nestjs/common';
import * as AWS from "aws-sdk";
import slugify from 'slugify';
import axios from 'axios';
const shortid = require('shortid');

export interface deleteDto {
    Key: string[];
}
import fs from 'fs'

@Injectable()
export class S3Service {
    s3 = new AWS.S3
        ({
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });

    async uploadFile(edition: number) {
        const fileContent = fs.readFileSync(process.cwd() + `/${edition}.png`);
        console.log(process.cwd() + `/${edition}.png`)
        console.log(fileContent)
        const res = await this.s3_upload(fileContent, `${process.env.AWS_S3_BUCKET}/game`, `${shortid.generate()}`, 'image/png');
        console.log(`File uploaded successfully. ${res.Location}`);
        return res;
    }

    async uploadFiles(files) {

        let response = [];
        for (const file of files) {
            try {
                let fileName = `${shortid.generate()}-${slugify(file.originalname)}`;
                console.log('slugify', slugify(file.originalname));
                const res = await this.s3_upload(file.buffer, process.env.AWS_S3_BUCKET, fileName, file.mimetype);
                console.log('res', res);
                response.push(res);

            }
            catch (err) {
                console.log(err);
            }
        }
        return response;


    }

    async s3_upload(file, bucket, name, mimetype) {
        const params =
        {
            Bucket: bucket,
            Key: String(name),
            Body: file,
            ACL: "public-read",
            ContentType: mimetype,
            ContentDisposition: "inline",
            CreateBucketConfiguration:
            {
                LocationConstraint: "ap-south-1"
            }
        };
        try {
            const imgData = await this.s3.upload(params).promise();
            const url = imgData?.Location;
            let response = await axios({
                method: 'get',
                url: 'http://nsfw.whiteorigin.in:9000/image?url='+url,
            });
            const imagenotAllowPer = (response?.data && response?.data > 0) ? response?.data * 100 : 0;
            if(imagenotAllowPer < 80)
            {
                return {statusCode: 200, Location: imgData?.Location, Key: imgData?.Key, key: imgData?.Key, message: 'File Allowed'}
            }
            else
            {
                this.s3_delete({Key: [ imgData?.Key ]});
                return {statusCode: 0, Location: "", Key: "", key: "", message: 'File Not Allowed'};
            }
        }
        catch (e) {
            console.log(e);
        }
    }


    async fileUpload(params) {
        return new Promise((resolve, reject) => {
            (async () => {
                this.s3.upload(params, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                })
            })();
        });
    }

    async s3_delete(params: deleteDto) {
        try {

            let objects = [];
            console.log('params', params)
            if (params) {
                params.Key.forEach((key) => {
                    objects.push({ Key: key })
                })

                let options = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Delete: {
                        Objects: objects
                    }
                };

                try {
                    return await this.s3.deleteObjects(options).promise()

                }
                catch (err) {
                    console.log(err)
                    return err;
                }
            }
        } catch (err) {
            console.log('err', err);
        }
    }


}
