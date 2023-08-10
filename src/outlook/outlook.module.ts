import { Module } from '@nestjs/common';
import { OutlookService } from './outlook.service';
import { OutlookController } from './outlook.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutlookSchema } from 'src/outlook/entities/outlook.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([OutlookSchema]),
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
    secret: 'mysecret',
    signOptions: {
      expiresIn: "120000000h"
    },
  })],
  controllers: [OutlookController],
  providers: [OutlookService],
  exports: [OutlookService],
})
export class OutlookModule {}
