import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { ReportContentController, ReportProblemController, RequestValidationController, SettingsController, UserOperationController } from './settings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { BlockedSchema, MutedSchema, RestrictSchema } from './entities/blocked.entity';
import { ReportContentSchema, ReportProblemSchema, RequestValidationSchema } from './entities/setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    BlockedSchema,
    RestrictSchema,
    MutedSchema,
    ReportProblemSchema,
    RequestValidationSchema,
    ReportContentSchema
  ]),
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
    secret: 'mysecret',
    signOptions: {
      expiresIn: "120000000h"
    },
  })
  ],
  controllers: [
    SettingsController,
    RequestValidationController,
    ReportProblemController,
    UserOperationController,
    ReportContentController
  ],
  providers: [SettingsService]
})
export class SettingsModule { }
