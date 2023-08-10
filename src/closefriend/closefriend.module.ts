import { Module } from '@nestjs/common';
import { ClosefriendService } from './closefriend.service';
import { ClosefriendController } from './closefriend.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloseFriendSchema } from './entities/closefriend.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { FCMModule } from 'src/fcm-notification/fcm.module';

@Module({
  imports: [TypeOrmModule.forFeature([CloseFriendSchema]),
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
    secret: 'mysecret',
    signOptions: {
      expiresIn: "120000000h"
    },
  }),
  FCMModule],
  controllers: [ClosefriendController],
  providers: [ClosefriendService]
})
export class ClosefriendModule { }
