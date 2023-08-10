import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MessagesController } from './messaages.controller';
import { MessageSchema } from './entities/message.entity';
import { MessagesService } from './messages.service';
import { FCMModule } from 'src/fcm-notification/fcm.module';

@Module({
  imports: [TypeOrmModule.forFeature([MessageSchema]),
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
    secret: 'mysecret',
    signOptions: {
      expiresIn: "120000000h"
    },
  }),
  FCMModule],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
