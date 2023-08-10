import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import console from 'console';
import { getManager, Repository } from 'typeorm';
import { CreateBlockUserDto, CreateMuteUserDto, CreateResctricUserDto, CreateSettingDto, ReportContentDto, ReportContentUpdateDto, ReportProblemSchemaDto, RequestValidationDto } from './dto/create-setting.dto';
import { UpdateReportProblemSchemaDto, UpdateRequestValidationDto, UpdateSettingDto } from './dto/update-setting.dto';
import { BlockedSchema, MutedSchema, RestrictSchema } from './entities/blocked.entity';
import { ReportContentSchema, ReportProblemSchema, RequestValidationSchema } from './entities/setting.entity';

@Injectable()
export class SettingsService {

  constructor(
    @InjectRepository(BlockedSchema) private blockedRepository: Repository<BlockedSchema>,
    @InjectRepository(RestrictSchema) private restrictRepository: Repository<RestrictSchema>,
    @InjectRepository(MutedSchema) private muteRepository: Repository<MutedSchema>,
    @InjectRepository(ReportProblemSchema) private reportSchemaRepository: Repository<ReportProblemSchema>,
    @InjectRepository(RequestValidationSchema) private requestValidationRepository: Repository<RequestValidationSchema>,
    @InjectRepository(ReportContentSchema) private reportContentRepository: Repository<ReportContentSchema>,
  ) { }
  queryManager = getManager()

  async requestValidation(requestValidation: RequestValidationDto,
    document_type: string,
    category: string,
    user_id: number) {
    const data = await this.requestValidationRepository.findOne({
      user_id: user_id
    });
    if (!data) {
      const request = await this.requestValidationRepository.save({
        ...requestValidation,
        document_type: document_type,
        category: category,
        user_id: user_id
      });
      return {
        message: "Request Done Succsesfully",
        status: 200,
        data: request
      }
    }
    else
      throw new BadRequestException('Request is Already in process').getResponse()
  } 
  async updateValidation(requestValidation: UpdateRequestValidationDto,
    user_id: number) {
    const data = await this.requestValidationRepository.findOne({
      user_id: user_id
    });
    if (data) {
      await this.requestValidationRepository.update({ id: data?.id }, {
        ...requestValidation
      });
      return {
        message: "Request Updated Succsesfully",
        status: 200,
      }
    }
    else
      throw new BadRequestException('Request Not Found').getResponse()
  }
  async requestValidationGet(user_id: number) {
    const data = await this.requestValidationRepository.findOne({
      user_id: user_id
    });
    if (data) {
      return {
        message: "Fetched Succsesfully",
        data: data,
        status: 200,
      }
    }
    else
      throw new BadRequestException('Request Not Found').getResponse()
  }
  async requestValidationDelete(user_id: number) {
    const data = await this.requestValidationRepository.findOne({
      user_id: user_id
    });
    if (data) {
      await this.requestValidationRepository.remove(data);
      return {
        message: "Deleted Succsesfully",
        status: 200,
      }
    }
    else
      throw new BadRequestException('Request Not Found').getResponse()
  }
  async createBlocke(createBlockedDto: CreateBlockUserDto, user_id: string) {
    if (+createBlockedDto?.blocked_user_id === +user_id) {
      throw new BadRequestException('Please Provide Diffret Mute Id').getResponse()
    }
    if (await this.getUser(+user_id)) {
      if (!await this.getUser(+createBlockedDto?.blocked_user_id)) {
        throw new NotFoundException('Bloked User Not Found').getResponse()
      }
      const checkBloker = await this.blockedRepository.findOne({
        blocked_user_id: createBlockedDto?.blocked_user_id,
        blocker_user_id: +user_id
      });
      console.log(checkBloker)
      if (!checkBloker) {
        await this.blockedRepository.save({
          blocked_user_id: createBlockedDto?.blocked_user_id,
          blocker_user_id: +user_id
        });
        return {
          message: "Blocked Succsesfully",
          status: 200
        }
      }
      else {
        return {
          message: "Already Blocked",
          status: 200
        }
      }
    }
    else {
      throw new NotFoundException('Bloker User Not Found').getResponse()
    }
  }
  async createRestrict(createRestictDto: CreateResctricUserDto, user_id: string) {
    if (+createRestictDto?.restricted_user_id === +user_id) {
      throw new BadRequestException('Please Provide Diffret Mute Id').getResponse()
    }
    if (await this.getUser(+user_id)) {
      if (!await this.getUser(+createRestictDto?.restricted_user_id)) {
        throw new NotFoundException('Restict User Not Found').getResponse()
      }
      const checkBloker = await this.restrictRepository.findOne({
        restricter_user_id: +user_id,
        restricted_user_id: createRestictDto?.restricted_user_id
      });
      if (!checkBloker) {
        await this.restrictRepository.save({
          restricted_user_id: createRestictDto?.restricted_user_id,
          restricter_user_id: +user_id
        });
        return {
          message: "Resticted Succsesfully",
          status: 200
        }
      }
      else {
        return {
          message: "Already Resticted",
          status: 200
        }
      }
    }
    else {
      throw new NotFoundException('Restict User Not Found').getResponse()
    }
  }
  async createMute(createMuteDto: CreateMuteUserDto, user_id: string) {
    if (+createMuteDto?.muted_user_id === +user_id) {
      throw new BadRequestException('Please Provide Diffret Mute Id').getResponse()
    }
    if (await this.getUser(+user_id)) {
      if (!await this.getUser(+createMuteDto?.muted_user_id)) {
        throw new NotFoundException('Mute User Not Found').getResponse()
      }
      const checkBloker = await this.muteRepository.findOne({
        muter_user_id: +user_id,
        muted_user_id: createMuteDto?.muted_user_id,
      });
      if (!checkBloker) {
        await this.muteRepository.save({
          muted_user_id: createMuteDto?.muted_user_id,
          muter_user_id: +user_id
        });
        return {
          message: "Muted  User Succsesfully",
          status: 200
        }
      }
      else {
        return {
          message: "Already Muted",
          status: 200
        }
      }
    }
    else {
      throw new NotFoundException('Muted User Not Found').getResponse()
    }
  }
  async getBlocke(user_id: string) {
    const checkBloker = await this.blockedRepository.find({
      blocker_user_id: +user_id
    });
    var ids = [];
    if (checkBloker?.length > 0) {
      await checkBloker.map((user) => {
        ids.push(user.blocked_user_id);
      })
      var idsString = ids.join(',')
      const query = `select id,username,profile_photo from users where id in(${idsString});`
      var userIfUsername = await this.queryManager.query(query);
      return {
        message: "Fetched Succsesfully",
        status: 200,
        blocks: userIfUsername
      }
    }
    else {
      return {
        message: "Fetched Succsesfully",
        status: 200,
        blocks: []
      }
    }

  }
  async getRestrict(user_id: string) {
    const checkBloker = await this.restrictRepository.find({
      restricter_user_id: +user_id
    });
    var ids = [];
    if (checkBloker?.length > 0) {
      await checkBloker.map((user) => {
        ids.push(user.restricted_user_id);
      })
      var idsString = ids.join(',')
      const query = `select id,username,profile_photo from users where id in(${idsString});`
      var userIfUsername = await this.queryManager.query(query);
      return {
        message: "Fetched Succsesfully",
        status: 200,
        blocks: userIfUsername
      }
    }
    else {
      return {
        message: "Fetched Succsesfully",
        status: 200,
        blocks: []
      }
    }

  }
  async geteMute(user_id: string) {
    const checkBloker = await this.muteRepository.find({
      muter_user_id: +user_id
    });
    var ids = [];
    if (checkBloker?.length > 0) {
      await checkBloker.map((user) => {
        ids.push(user.muted_user_id);
      })
      var idsString = ids.join(',')
      const query = `select id,username,profile_photo from users where id in(${idsString});`
      var userIfUsername = await this.queryManager.query(query);
      return {
        message: "Fetched Succsesfully",
        status: 200,
        blocks: userIfUsername
      }
    }
    else {
      return {
        message: "Fetched Succsesfully",
        status: 200,
        blocks: []
      }
    }
  }
  async removeBlock(id: string, user_id: string) {
    if (+id === +user_id) {
      throw new BadRequestException('Please Provide Diffret Block Id').getResponse()
    }
    const checkBlock = await this.blockedRepository.findOne({
      blocker_user_id: +user_id,
      blocked_user_id: +id
    });
    if (!checkBlock) {
      throw new NotFoundException('Restrict User Not Found').getResponse()
    }
    else {
      await this.blockedRepository.remove(checkBlock);
      return {
        message: "Succsesfully Deleted",
        status: 200
      }
    }

  }
  async removeRestrict(id: string, user_id: string) {
    if (+id === +user_id) {
      throw new BadRequestException('Please Provide Diffret Restict Id').getResponse()
    }
    const checkRestrict = await this.restrictRepository.findOne({
      restricter_user_id: +user_id,
      restricted_user_id: +id
    });
    if (!checkRestrict) {
      throw new NotFoundException('Restrict User Not Found').getResponse()
    }
    else {
      await this.restrictRepository.remove(checkRestrict);
      return {
        message: "Succsesfully Deleted",
        status: 200
      }
    }
  }
  async removeMute(id: string, user_id: string) {
    if (+id === +user_id) {
      throw new BadRequestException('Please Provide Diffret Mute Id').getResponse()
    }
    const checkMute = await this.muteRepository.findOne({
      muter_user_id: +user_id,
      muted_user_id: +id
    });
    if (!checkMute) {
      throw new NotFoundException('Muted User Not Found').getResponse()
    }
    else {
      await this.muteRepository.remove(checkMute);
      return {
        message: "Succsesfully Deleted",
        status: 200
      }
    }
  }
  async addReportProblem(reportProblemSchema: ReportProblemSchemaDto, user_id: number) {
    await this.reportSchemaRepository.save({
      ...reportProblemSchema,
      user_id: user_id
    });
    return {
      message: "Succsesfully Added",
      status: 200
    }
  }
  async updateReportProblem(reportProblemSchema: UpdateReportProblemSchemaDto, id: number) {
    const data = await this.reportSchemaRepository.findOne({ id: id })
    if (data) {
      await this.reportSchemaRepository.update({ id: id }, {
        ...reportProblemSchema,
      });
      return {
        message: "Succsesfully Updated",
        status: 200
      }
    }
    else {
      return {
        message: "Report Not Found",
        status: 200
      }
    }

  }
  async getReportProblem(user_id: number) {
    const query = `select * from user_report_problem where user_id = '${user_id}';`
    var data = await this.queryManager.query(query);
    if (data?.length > 0)
      return {
        message: "Report Not Found",
        status: 200,
        data: data
      }
    return {
      message: "Report Not Found",
      status: 200,
      data: data
    }
  }
  async deleteReportProblem(id: number) {
    const query = `delete from user_report_problem where id = '${id}';`
    await this.queryManager.query(query);
    return {
      message: "Report Delete",
      status: 200,
    }
  }
  async addreportContent(reportContentDto: ReportContentDto, type: string, user_id: number) {
    const query = `select * from user_content_report 
    where user_id = '${user_id}'
    and type='${type}' and type_id='${reportContentDto?.type_id}';`
    var data = await this.queryManager.query(query);
    console.log(data)
    console.log(query)
    if (data?.length > 0)
      throw new BadRequestException("Report Already Found.").getResponse()
    else {
      const inserQuery = `INSERT INTO user_content_report(
	                  type, report_text, type_id, "user_id")
	                  VALUES ('${type}',
                       '${reportContentDto?.report_text}',
                       ${reportContentDto?.type_id},
                       ${user_id});`
      console.log(inserQuery)
      await this.queryManager.query(inserQuery)
        .then((res) => {
        })
        .catch((err) => {
          return {
            status: 500,
            message: "Something Went Wrong"
          }
        });
      return {
        status: 200,
        message: "Report Added"
      }
    }
  }
  async updatereportContent(createCommentDto: ReportContentUpdateDto, id: number,
    user_id: number) {
    const query = `select * from user_content_report 
    where id = '${id}';`
    var data = await this.queryManager.query(query);
    console.log(query)

    if (data?.length <= 0)
      throw new BadRequestException("Report Not Found.").getResponse()
    else {
      const inserQuery = `UPDATE user_content_report
        SET report_text='${createCommentDto?.report_text}' where id=${id}
        and "user_id"=${user_id} `
      console.log(inserQuery)

      await this.queryManager.query(inserQuery)
        .then((res) => {

        })
        .catch((err) => {
          return {
            status: 500,
            message: "Something Went Wrong"
          }
        });
      return {
        status: 200,
        message: "Report Updated"
      }
    }
  }
  async deleteReportContent(id: number) {
    const query = `select * from user_content_report 
    where id = '${id}';`
    var data = await this.queryManager.query(query);
    if (data?.length <= 0)
      throw new BadRequestException("Report Not Found.").getResponse()
    else {
      const inserQuery = `delete from user_content_report where id=${id}`
      await this.queryManager.query(inserQuery)
        .then((res) => {

        })
        .catch((err) => {
          return {
            status: 500,
            message: "Something Went Wrong"
          }
        });
      return {
        status: 200,
        message: "Report Deleted"
      }
    }
  }
  async getReportContent(user_id: number) {
    const query = `select * from user_content_report 
    where user_id = '${user_id}';`
    var data = await this.queryManager.query(query);
    if (data?.length > 0)
      return {
        message: "Report Not Found",
        status: 200,
        data: data
      }
    return {
      message: "Report Not Found",
      status: 200,
      data: data
    }
  }
  async getUser(user_id: number) {
    const query = `select * from users where id = ${user_id};`
    var userIfUsername = await this.queryManager.query(query);
    if (userIfUsername?.length > 0)
      return true;
    return false;
  }
}
