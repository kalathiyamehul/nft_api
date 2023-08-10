import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsSchema } from './entities/post.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { FCMModule } from 'src/fcm-notification/fcm.module';
import { S3Service } from 'src/uploads/s3service.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostsSchema]),
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
    secret: 'mysecret',
    signOptions: {
      expiresIn: "120000000h"
    },
  }),
  FCMModule],
  controllers: [PostsController],
  providers: [PostsService, S3Service],
  exports: [PostsService]
})
export class PostsModule { }
