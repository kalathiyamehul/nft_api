import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { InstagramService } from './instagram.service';
import { InstagramController } from './instagram.controller';


@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
    secret: 'mysecret',
    signOptions: {
      expiresIn: "120000000h"
    },
  }),],
  controllers: [InstagramController],
  providers: [InstagramService]
})
export class InstagramModule { }
