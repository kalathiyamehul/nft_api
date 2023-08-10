import { Module } from '@nestjs/common';
import { IllustrationService } from './illustration.service';
import { IllustrationController } from './illustration.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { FutureVisiteSchema } from 'src/future-visite/entities/future-visite.entity';
import { IllustrationSchema } from './entities/illustration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IllustrationSchema]),
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
    secret: 'mysecret',
    signOptions: {
      expiresIn: "120000000h"
    },
  })
  ],
  controllers: [IllustrationController],
  providers: [IllustrationService]
})
export class IllustrationModule { }
