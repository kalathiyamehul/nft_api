import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import request from 'request';
import FormData from 'form-data';
import { CreateContactusDto } from './dto/create-contactus.dto';
import { UserSchema } from '../users/entities/user.entity';
import { getRepository, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ContactusSchema } from './entities/contactus.entity';

@Injectable()
export class ContactusService {
  constructor(
    @InjectRepository(ContactusSchema)
    private contactusRepository: Repository<ContactusSchema>,
  ) {}

  async create(createContactusDto: CreateContactusDto) {
    let contactus = new ContactusSchema();
    contactus.email = createContactusDto.email;
    contactus.name = createContactusDto.name;
    contactus.subject = createContactusDto?.subject
      ? createContactusDto?.subject
      : '';
    contactus.description = createContactusDto?.description
      ? createContactusDto?.description
      : '';
    try {
      let res = await this.contactusRepository.save(contactus);
      if (res) {
        return res;
      }
    } catch (error) {
      console.log('contactus error occured');
      return { statusCode: 400, message: 'bad request' };
    }
  }

  async findAll() {
    let res = await this.contactusRepository.find();
    return res;
  }

  // async findOne() {
  //   // let res = await this.contactusRepository.findOne({id});
  //   let res = await this.contactusRepository.find({id});
  //   console.log('all contact data', res);
  // }
}
