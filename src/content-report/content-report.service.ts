import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, getRepository, Repository } from 'typeorm';
import { ContentReportSchema } from './entities/content-report.entity';
import { UserSchema } from '../users/entities/user.entity';

@Injectable()
export class ContentReportService {
  constructor(
    @InjectRepository(ContentReportSchema) private contentReportRepository: Repository<ContentReportSchema>
  ) { }
  queryManager = getManager();
  userRepository = getRepository(UserSchema);
  async addreport(type: string, type_id: number, category: string, user_id: number) {
    var checkType;
    if (type == 'posts')
      checkType = `select * from posts where id=${type_id}`
    else if (type == 'reels')
      checkType = `select * from reels where id=${type_id}`
    const checkTypedata = await this.queryManager.query(checkType)
    if (checkTypedata?.length <= 0) {
      return {
        data: false,
        message: `${type} Not Found`
      }
    }

    const inserQuery = `INSERT INTO content_report(type, type_id, category, "authorId") VALUES ('${type}',${type_id},'${category}',${user_id});`
    await this.queryManager.query(inserQuery)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        return {
          status: 500,
          data: false,
          message: "Something Went Wrong"
        }
      });
    return {
      status: 200,
      data: true,
      message: "Report Added"
    }
  }

  getReportCategories() {
    return [
      { key: "SPAM", value: "It's Spam" },
      { key: "NOT_LIKE", value: "I just don't like it" },
      { key: "NUDITY", value: "Nudity or Sexual Activity" },
      { key: "HATE_SPEECH", value: "Hate Speech or Symbols" },
      { key: "VIOLENCE", value: "Violence or Dangerous Organization" },
      { key: "FALSE_INFO", value: "False Information" },
      { key: "BULLING", value: "Bulling or Harasment" },
      { key: "SCAM", value: "Scam or Fraud" },
      { key: "PROPERTY_VIOLATION", value: "Intelleactual Property Violation" },
      { key: "SUCIDE", value: "Sucide or self Injury" },
      { key: "ILLEGAL_GOODS", value: "Sale of Illegal or Regulated Goods" }
    ];
  }

}
