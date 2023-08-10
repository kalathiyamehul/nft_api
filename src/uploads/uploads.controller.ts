import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Delete,
  Body,
  Req,
  UploadedFile,
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import { ApiBearerAuth, ApiBody, ApiConsumes, ApiProperty, ApiTags } from '@nestjs/swagger';
import { S3Service } from './s3service.service';
import { UploadsService } from './uploads.service';
export const ApiFile = (fileName: string = 'file'): MethodDecorator => (
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) => {
  ApiBody({
    schema: {
      type: 'object',
      properties: {
        [fileName]: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })(target, propertyKey, descriptor);
};

export class deleteObjectDTO {
  Key: string[];
}
export class FileUpload {
  @ApiProperty()
  fileType: string;
  @ApiProperty()
  bucketname: string;
  @ApiProperty()
  cdnurl: string;
}
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateReelDtoVideo, CreateWatermarkVideoDto } from 'src/reels/dto/create-reel.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('attachments')
@ApiTags('UploadFiles')
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private s3Service: S3Service,
  ) { }

  @Post()
  @UseInterceptors(FilesInterceptor('file'))
  async uploadFile(@UploadedFiles() attachment: Array<Express.Multer.File>) {
    if (!attachment || attachment.length === 0) {
      return;
    }
    const response = await this.s3Service.uploadFiles(attachment);
    if (response[0]?.statusCode === 0) {
      return {
        "image": "",
        "message": response[0]?.message,
        "statusCode": 400,
      };
    }
    else {
      return { image: process.env.AWS_CLOUDFRONT_S3_DOMAIN + response[0]['key'], message: 'Uploaded Sucsessfully' };
    }
  }

  @Get('diff_quality/:offset')
  async diff_quality_video(@Param('offset') offset: string) {
    await this.uploadsService.diff_quality_video(+offset, '');
    return true;
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('create_reels')
  @ApiConsumes('multipart/form-data')
  @ApiFile('attachment')
  @UseInterceptors(
    FileInterceptor('attachment', {
      storage: diskStorage({
        destination: './',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          //Calling the callback passing the random name generated with the original extension name
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadVideo(
    @UploadedFile() attachment: Express.Multer.File,
    @Body() body: CreateReelDtoVideo,
    @Req() req
  ) {
    const id = req?.user?.payload?.id
    return await this.uploadsService.create_reels(attachment, body, id)
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('create_watermark_video')
  async createWatermarkVideo(@Body() body: CreateWatermarkVideoDto): Promise<any> {
    return await this.uploadsService.createWatermarkVideo(body)
  }

  @Post('new')
  @UseInterceptors(FilesInterceptor('file'))
  async uploadFileNew(
    @UploadedFiles() attachment: Array<Express.Multer.File>,
    @Body() body: FileUpload,
  ) {
    if (!attachment || attachment.length === 0) {
      return {
        status: 400, message: "File required (file)"
      }
    }
    if (!body?.bucketname || !body?.cdnurl || !body?.fileType) {
      return {
        status: 400, message: "Bucketname(bucketname) ,CDN URL(cdnurl) and File Type(fileType) is required."
      }
    }
    const response = await this.s3Service.uploadFilesToS3(attachment, body);
    return { image: response, message: 'Uploaded Sucsessfully' };
  }

  @Post('delete')
  async deleteFile(@Body() deleteObject: deleteObjectDTO) {
    return await this.s3Service.s3_delete(deleteObject);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('upload_chat_file')
  @UseInterceptors(FilesInterceptor('file'))
  async uploadChatFile(@UploadedFiles() attachment: Array<Express.Multer.File>) {
    if (!attachment || attachment.length === 0) {
      console.log("No files are selected");
      return;
    }
    const response = await this.s3Service.uploadChatFiles(attachment);
    if (response) {
      let data = [];
      data = response.map(function (item) {
        // const extension = item['Location'].split(/[#?]/)[0].split('.').pop().trim();
        // const videoext = ['mp4','mov','wmv','avi','avchd','mkv','flv','f4v','swf'];
        // const imgext = ['tif','tiff','jpg','jpeg','gif','png','bmp','eps','raw','cr2','nef','orf','sr2','heic'];
        let file = {};
        if (item?.statusCode === 0) {
          file = {
            "image": "",
            "message": item?.message,
            "statusCode": 400,
          };
        }
        else {
          file = {
            "url": process.env.AWS_CLOUDFRONT_S3_DOMAIN + item['key'],
            // "type": (videoext.includes(extension)) ? "video" : ((imgext.includes(extension)) ? "image" : "document")
            "type": item['type']
          }
        }
        return file;
      });
      return { data: data, message: 'Uploaded Sucsessfully' };
    }
  }
}
