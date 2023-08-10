import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSchema } from 'src/users/entities/user.entity';
import { getRepository, Repository } from 'typeorm';
import { CreateIllustrationDto } from './dto/create-illustration.dto';
import { UpdateIllustrationDto } from './dto/update-illustration.dto';
import { IllustrationSchema } from './entities/illustration.entity';

@Injectable()
export class IllustrationService {

  constructor(
    @InjectRepository(IllustrationSchema) private illustrationRepository: Repository<IllustrationSchema>,
  ) { }
  userRepository = getRepository(UserSchema);


  async create(createIllustrationDto: CreateIllustrationDto, id: number) {
    const user = await this.userRepository.findOne({ id: id });
    const Illustration = await this.illustrationRepository.save({
      author: user,
      ...createIllustrationDto
    })
    delete Illustration?.author;
    return Illustration;
  }

  async findAll() {
    return await this.illustrationRepository.find()
  }
  async update(id: number, updateIllustrationDto: UpdateIllustrationDto) {
    const Illustration = await this.illustrationRepository.find({ id: id });
    if (Illustration.length > 0) {
      const Illustration = await this.illustrationRepository.update({ id: id }, {
        ...updateIllustrationDto
      })
      return {
        message: "Succsesfully Updated",
        status: 200,
      }
    }
    else {
      throw new NotFoundException('Illustration Not Found').getResponse()
    }
  }

  async remove(id: number) {
    const Illustration = await this.illustrationRepository.find({ id: id });
    if (Illustration.length > 0) {
      await this.illustrationRepository.remove(Illustration);
      return {
        message: "Succsesfully Deleted",
        status: 200
      }
    }
    else {
      throw new NotFoundException('Illustration Not Found').getResponse()
    }
  }
}
