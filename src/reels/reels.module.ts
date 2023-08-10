import { Module } from '@nestjs/common';
import { ReelsService } from './reels.service';
import { ReelsController } from './reels.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReelsSchema } from './entities/reel.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { FCMModule } from 'src/fcm-notification/fcm.module';

@Module({
  imports: [TypeOrmModule.forFeature([ReelsSchema]),
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
    secret: 'mysecret',
    signOptions: {
      expiresIn: "120000000h"
    },
  }),
    FCMModule],
  controllers: [ReelsController],
  providers: [ReelsService],
  exports: [ReelsService]
})
export class ReelsModule { }
