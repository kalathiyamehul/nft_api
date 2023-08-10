import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { SubscribeService } from './subscribe.service';
import { SubscribeController } from './subscribe.controller';
import { SubscriberSchema } from './entities/user.entity';


@Module({
  imports: [TypeOrmModule.forFeature([SubscriberSchema])
    ,PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
    secret: 'mysecret',
    signOptions: {
      expiresIn: "120000000h"
    },
  }),],
  controllers: [SubscribeController],
  providers: [SubscribeService]
})
export class SubscriberModule { }
