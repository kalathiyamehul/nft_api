import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVersionDto, UpdateVersionDto } from './dto/create-version.dto';
import { CheckVersionDto } from './dto/check-version.dto';
const shortid = require('shortid');
import { VersionSchema } from './entities/version.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, getRepository, Repository } from 'typeorm';
import { NftSchema } from 'src/nft/entities/nft.entity';
import { UserSchema } from '../users/entities/user.entity';

@Injectable()
export class VersionService {
  constructor(
    @InjectRepository(VersionSchema)
    private versionRepository: Repository<VersionSchema>,
  ) {}

  userRepository = getRepository(UserSchema);
  nftRepository = getRepository(NftSchema);
  queryManager = getManager();

  async create(createVersionDto: CreateVersionDto, id: number) {
    const user = await this.userRepository.findOne({ id: id });
    if (user?.is_admin === false) {
      throw new BadRequestException('Only admin can perform').getResponse()
    }

    const allowedversion = await this.versionRepository
      .createQueryBuilder('version')
      .addSelect(['MAX(version) AS maxVersion'])
      .where(`version.os = :os`, {
        os: createVersionDto.os,
      })
      .andWhere(`version.version >= :version`, {
        version: createVersionDto.version,
      })
      .groupBy('version.id')
      .orderBy('version.id','DESC')
      .limit(1)
      .getOne();

    if(allowedversion)
    {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Add version grater then '+allowedversion.version+' for '+allowedversion.os,
        version: '',
      }).getResponse();
    }
    else
    {
      const version = new VersionSchema();
      version.os = createVersionDto.os;
      version.version = createVersionDto.version;
      version.is_force_update = createVersionDto.is_force_update;
      
      const finalversion = await this.versionRepository.save(version).catch((err) => {
        console.log(err);
        return err;
      });
      return finalversion;
    }
  }

  async update(updateVersionDto: UpdateVersionDto, id: number) {
    const user = await this.userRepository.findOne({ id: id });
    if (user?.is_admin === false) {
      throw new BadRequestException('Only admin can perform').getResponse()
    }

    const version = await this.versionRepository
      .createQueryBuilder('version')
      .where(`version.id=:id`, {
        id: updateVersionDto.id,
      })
      .getOne();
    const allowedversion = await this.versionRepository
      .createQueryBuilder('version')
      .addSelect(['MAX(version) AS maxVersion'])
      .where(`version.os = :os`, {
        os: updateVersionDto.os,
      })
      .andWhere(`version.version >= :version`, {
        version: updateVersionDto.version,
      })
      .andWhere(`version.id != :id`, {
        id: updateVersionDto.id,
      })
      .groupBy('version.id')
      .orderBy('version.id','DESC')
      .limit(1)
      .getOne();

    if(allowedversion)
    {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Add version grater then '+allowedversion.version+' for '+allowedversion.os,
        version: '',
      }).getResponse();
    }
    else
    {
      // const version = new VersionSchema();
      if(updateVersionDto.os)
      {
        version.os = updateVersionDto.os;
      }
      if(updateVersionDto.version)
      {
        version.version = updateVersionDto.version;
      }
      version.is_force_update = updateVersionDto.is_force_update;
      
      const finalversion = await this.versionRepository.save(version).catch((err) => {
        console.log(err);
        return err;
      });
      return finalversion;
    }
  }

  async check(checkVersionDto: CheckVersionDto) {
    const lastversion = await this.versionRepository
      .createQueryBuilder('version')
      .select(['id','os','version'])
      .addSelect('max(case when (version.is_force_update = true) then 1 else 0 end)','fupdate')
      .where(`version.os = :os`, {
        os: checkVersionDto.os,
      })
      .andWhere(`version.version > :version`, {
        version: checkVersionDto.version,
      })
      .groupBy('version.id')
      .orderBy('fupdate','DESC')
      .getRawOne();
    if (lastversion) {
      return {
        statusCode: 200,
        message: 'version found',
        data: {
          needUpdate: true,
          forceUpdate: (lastversion.fupdate === 1) ? true : false
        }
      };
    } else {
      return {
        statusCode: 200,
        message: 'You have stable version',
        data: {
          needUpdate: false,
          forceUpdate: false
        }
      };
    }
  }
}
