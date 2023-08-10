import { Module } from '@nestjs/common';
import { LocarnoService } from './locarno.service';
import { LocarnoController } from './locarno.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationDataSchema } from './entities/locarno.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LocationDataSchema]),
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
    secret: 'mysecret',
    signOptions: {
      expiresIn: "120000000h"
    },
  }),],
  controllers: [LocarnoController],
  providers: [LocarnoService]
})
export class LocarnoModule {}
