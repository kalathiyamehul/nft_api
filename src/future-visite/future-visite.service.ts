import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSchema } from 'src/users/entities/user.entity';
import { getRepository, Repository } from 'typeorm';
import { CreateFutureVisiteDto } from './dto/create-future-visite.dto';
import { UpdateFutureVisiteDto } from './dto/update-future-visite.dto';
import { FutureVisiteSchema } from './entities/future-visite.entity';

@Injectable()
export class FutureVisiteService {

  constructor(
    @InjectRepository(FutureVisiteSchema) private futureVisiteRepository: Repository<FutureVisiteSchema>,
  ) { }
  userRepository = getRepository(UserSchema);

  async create(createFutureVisiteDto: CreateFutureVisiteDto, id: number) {
    const user = await this.userRepository.findOne({ id: id });
    const FutureVisite = await this.futureVisiteRepository.save({
      author: user,
      ...createFutureVisiteDto
    })
    delete FutureVisite?.author;
    return FutureVisite;
  }

  async findAll() {
    return await this.futureVisiteRepository.find()
  }

  async update(id: number, updateFutureVisiteDto: UpdateFutureVisiteDto) {
    const FutureVisite = await this.futureVisiteRepository.find({ id: id });
    if (FutureVisite.length > 0) {
      const FutureVisite = await this.futureVisiteRepository.update({ id: id }, {
        ...updateFutureVisiteDto
      })
      return {
        message: "Succsesfully Updated",
        status: 200,
      }
    }
    else {
      throw new NotFoundException('FutureVisite Not Found').getResponse()
    }
  }

  async remove(id: number) {
    const FutureVisite = await this.futureVisiteRepository.find({ id: id });
    if (FutureVisite.length > 0) {
      await this.futureVisiteRepository.remove(FutureVisite);
      return {
        message: "Succsesfully Deleted",
        status: 200
      }
    }
    else {
      throw new NotFoundException('FutureVisite Not Found').getResponse()
    }
  }
}
