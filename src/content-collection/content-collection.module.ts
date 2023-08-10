import { Module } from '@nestjs/common';
import { ContentCollectionService } from './content-collection.service';
import { ContentCollectionController } from './content-collection.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentCollectionSchema } from './entities/content-collection.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { FCMModule } from 'src/fcm-notification/fcm.module';

@Module({
  imports: [TypeOrmModule.forFeature([ContentCollectionSchema]),
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
    secret: 'mysecret',
    signOptions: {
      expiresIn: "120000000h"
    },
  }),
  FCMModule],
  controllers: [ContentCollectionController],
  providers: [ContentCollectionService]
})
export class ContentCollectionModule { }
