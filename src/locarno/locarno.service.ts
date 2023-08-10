import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { CreateLocationDto } from './dto/create-locarno.dto';
import { NearByUserDto, recentActivity } from './dto/update-locarno.dto';
import { LocationDataSchema } from './entities/locarno.entity';

@Injectable()
export class LocarnoService {

  constructor(
    @InjectRepository(LocationDataSchema) private locationdataRepository: Repository<LocationDataSchema>,
  ) { }

  queryManager = getManager()
  async nearByUser(nearByUserDto:NearByUserDto) {
    var query = `select id,email,username,profile_photo,
        (point("latitude"::float8,"longitude"::float8) <@> point('${nearByUserDto.latitude}','${nearByUserDto.longitude}'))*1609.34
        as distance
        from users
        where
        "latitude"!='' and "longitude"!='' and
        (point("latitude"::float8,"longitude"::float8) <@> point('${nearByUserDto.latitude}','${nearByUserDto.longitude}'))*1609.34<${nearByUserDto.meter};
`
    var userData = await this.queryManager.query(query);
    if (userData?.length > 0)
    { 
      
      return {
        statusCode: 201,
        users:userData,
        message: 'Succsefully Completed',
      };
    }
    else {
      throw new NotFoundException('User not found in Range').getResponse();
    }
  }
  async getRecentActivity(recentActivity: recentActivity) {
    var limit = 1;
    if (recentActivity?.limit != undefined)
      limit = recentActivity?.limit;
    
    if(!recentActivity?.user_id) {
      throw new BadRequestException('User id is required.').getResponse();
    }

    const nftQuery = `select * from nfts where "authorId" = ${recentActivity?.user_id} order by id desc limit ${limit};`
    console.log(nftQuery)
    var nftQueryData = await this.queryManager.query(nftQuery);
    var data = []
    if (nftQueryData?.length > 0) {
      data.push({ "nfts": nftQueryData })
    }

    const storiesQuery = `select * from stories where "authorId" = ${recentActivity?.user_id} and status='Active' order by id desc limit ${limit};`
    var StoriesQueryData = await this.queryManager.query(storiesQuery);
    if (StoriesQueryData?.length > 0) {
      data.push({ "stories": StoriesQueryData })
    }

    const reelsQuery = `select * from reels where "authorId" = ${recentActivity?.user_id} order by id desc limit ${limit};`
    var reelsQueryData = await this.queryManager.query(reelsQuery);
    if (reelsQueryData?.length > 0) {
      data.push({ "reels": reelsQueryData })
    }

    if (data?.length > 0) {
      return {
        statusCode: 201,
        data: data,
        message: 'Succsefully Completed',
      };
    }
    else {
      throw new NotFoundException('User activity Not found.').getResponse();
    }
  }
  async addLocation(createLocationDto: CreateLocationDto) {
    try {
      const query = `select * from location_data where
      latitude='${createLocationDto?.latitude}' and 
      longitude='${createLocationDto?.longitude}'`
      var userData = await this.queryManager.query(query);
      if (userData?.length > 0) {
        await this.locationdataRepository.update({
          longitude: createLocationDto?.longitude,
          latitude: createLocationDto?.latitude
        }, { ...createLocationDto });
        return {
          statusCode: 201,
          message: 'Succsefully Location Updated',
        };
      }
      else {
        await this.locationdataRepository.save({ ...createLocationDto });
        return {
          statusCode: 201,
          message: 'Succsefully Location Added',
        };
      }

    } catch {

    }
  }
  async getLocation() {
    try {
      const query = `select * from location_data`
      var userData = await this.queryManager.query(query);
      if (userData?.length >= 0) {
        return {
          statusCode: 201,
          location: userData,
          message: 'Succsefully Location Updated',
        };
      }
      else {
        return {
          statusCode: 201,
          message: 'Succsefully Location Added',
        };
      }

    } catch {

    }
  }

}
