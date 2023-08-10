import { Module } from '@nestjs/common';
import { NftService } from './nft.service';
import { NftController } from './nft.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NftSchema } from './entities/nft.entity';
import { S3Service } from './s3.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([NftSchema]),
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
    secret: 'mysecret',
    signOptions: {
      expiresIn: "120000000h"
    },
  }),],
  controllers: [NftController],
  providers: [NftService, S3Service]
})
export class NftModule { }
