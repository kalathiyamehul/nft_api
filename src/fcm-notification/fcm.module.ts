import { Module } from '@nestjs/common';
import { FCMService } from './fcm.service';
import { FCMController } from './fcm.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FCMSchema } from 'src/fcm-notification/entities/fcm.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([FCMSchema]),
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
    secret: 'mysecret',
    signOptions: {
      expiresIn: "120000000h"
    },
  })],
  controllers: [FCMController],
  providers: [FCMService],
  exports: [FCMService],
})
export class FCMModule {}
