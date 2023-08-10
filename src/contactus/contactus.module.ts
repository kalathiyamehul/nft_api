import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ContactusService } from './contactus.service';
import { ContactusController } from './contactus.controller';
import { ContactusSchema } from './entities/contactus.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContactusSchema]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'mysecret',
      signOptions: {
        expiresIn: "120000000h"
      },
    }),
  ],
  controllers: [ContactusController],
  providers: [ContactusService],
})
export class ContactusModule {}
