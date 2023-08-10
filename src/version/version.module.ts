import { Module } from '@nestjs/common';
import { VersionService } from './version.service';
import { VersionController } from './version.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VersionSchema } from 'src/version/entities/version.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([VersionSchema]),
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
    secret: 'mysecret',
    signOptions: {
      expiresIn: "120000000h"
    },
  })],
  controllers: [VersionController],
  providers: [VersionService],
  exports: [VersionService],
})
export class AppVersionModule {}
