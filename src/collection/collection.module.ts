import { Module } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionSchema } from './entities/collection.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([CollectionSchema]), AuthModule],
  controllers: [CollectionController],
  providers: [CollectionService]
})
export class CollectionModule { }
