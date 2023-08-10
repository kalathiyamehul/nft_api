import { Module } from '@nestjs/common';
import { ViewService } from './view.service';
import { ViewController } from './view.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViewsSchema } from './entities/view.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([ViewsSchema]),
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
    secret: 'mysecret',
    signOptions: {
      expiresIn: "120000000h"
    },
  })
  ],
  controllers: [ViewController],
  providers: [ViewService]
})
export class ViewModule { }
