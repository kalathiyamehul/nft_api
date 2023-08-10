import { Module } from '@nestjs/common';
import { FutureVisiteService } from './future-visite.service';
import { FutureVisiteController } from './future-visite.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FutureVisiteSchema } from './entities/future-visite.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([FutureVisiteSchema]),
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
    secret: 'mysecret',
    signOptions: {
      expiresIn: "120000000h"
    },
  })
  ],
  controllers: [FutureVisiteController],
  providers: [FutureVisiteService]
})
export class FutureVisiteModule { }
