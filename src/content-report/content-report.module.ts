import { Module } from '@nestjs/common';
import { ContentReportService } from './content-report.service';
import { ContentReportController } from './content-report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentReportSchema } from './entities/content-report.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { FCMModule } from 'src/fcm-notification/fcm.module';

@Module({
  imports: [TypeOrmModule.forFeature([ContentReportSchema]),
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
    secret: 'mysecret',
    signOptions: {
      expiresIn: "120000000h"
    },
  }),
  FCMModule],
  controllers: [ContentReportController],
  providers: [ContentReportService]
})
export class ContentReportModule { }
