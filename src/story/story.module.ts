import { Module } from '@nestjs/common';
import { StoryService } from './story.service';
import { StoryController } from './story.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { StorySchema } from './entities/story.entity';
import { FCMModule } from 'src/fcm-notification/fcm.module';

@Module({
  imports: [TypeOrmModule.forFeature([StorySchema]),
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
    secret: 'mysecret',
    signOptions: {
      expiresIn: "120000000h"
    },
  }),
  FCMModule],
  controllers: [StoryController],
  providers: [StoryService]
})
export class StoryModule { }
