import { Module } from '@nestjs/common';
import { HashtagService } from './hashtag.service';
import { HashtagController } from './hashtag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikesSchema } from 'src/like/entities/like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LikesSchema])],
  controllers: [HashtagController],
  providers: [HashtagService]
})
export class HashtagModule { }
