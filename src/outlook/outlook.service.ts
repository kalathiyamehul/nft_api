import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OutlookDto } from './dto/outlook.dto';
import { OutlookSchema } from './entities/outlook.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, getRepository, Repository } from 'typeorm';
import { NftSchema } from 'src/nft/entities/nft.entity';
import { UserSchema } from '../users/entities/user.entity';

@Injectable()
export class OutlookService {
  constructor(
    @InjectRepository(OutlookSchema)
    private outlookRepository: Repository<OutlookSchema>,
  ) {}

  userRepository = getRepository(UserSchema);
  nftRepository = getRepository(NftSchema);
  queryManager = getManager();

  async create(outlookDto: OutlookDto, id: number) {
    const user = await this.userRepository.findOne({ id: id });
    if(user)
    {
      const outlook = new OutlookSchema();
      outlook.gender = outlookDto.gender;
      outlook.education = outlookDto.education;
      outlook.work = outlookDto.work;
      outlook.height = outlookDto.height;
      outlook.weight = outlookDto.weight;
      outlook.age = outlookDto.age;
      outlook.drinking = outlookDto.drinking;
      outlook.smoking = outlookDto.smoking;
      outlook.relagion = outlookDto.relagion;
      outlook.language = outlookDto.language;
      outlook.intrest = outlookDto.intrest;
      outlook.politics = outlookDto.politics;
      outlook.relationshipStatus = outlookDto.relationshipStatus;
      outlook.isSelfData = outlookDto.isSelfData;
      outlook.user = user;
      
      const finaloutlook = await this.outlookRepository.save(outlook).catch((err) => {
        console.log(err);
        return err;
      });
      return finaloutlook;
    }
  }

}
