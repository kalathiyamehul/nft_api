import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { S3Service } from './s3service.service';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ReelsModule } from 'src/reels/reels.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ReelsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'mysecret',
      signOptions: {
        expiresIn: "120000000h"
      },
    })
  ],
  controllers: [UploadsController],
  providers: [UploadsService, S3Service],
})
export class UploadsModule {}
