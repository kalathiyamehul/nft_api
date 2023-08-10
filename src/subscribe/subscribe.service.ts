import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { SubscriberSchema } from './entities/user.entity';

@Injectable()
export class SubscribeService {
  constructor(
    @InjectRepository(SubscriberSchema)
    private subscriberRepository: Repository<SubscriberSchema>,
  ) {}

  // subscriberRepository = getRepository(SubscriberSchema);
  async add(createSubscriberDto: CreateSubscriberDto) {
    let existedEmail = await this.subscriberRepository.findOne({
      email: createSubscriberDto.email,
    });
    if (existedEmail) {
      return {
        statusCode: 400,
        message: 'Already subscribed',
      };
    } else {
      let subscriber = new SubscriberSchema();
      subscriber.email = createSubscriberDto.email;
      try {
        let res = await this.subscriberRepository.save(subscriber);
        if (res) {
          return { statusCode: 200, message: 'Thanks for subscribing !!' };
        }
      } catch (err) {
        console.log('subsciber error', err);
      }
    }
  }
}
