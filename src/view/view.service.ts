import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { ViewsSchema } from './entities/view.entity';

@Injectable()
export class ViewService {
  constructor(
    @InjectRepository(ViewsSchema) private viewRepository: Repository<ViewsSchema>,
  ) { }
  queryManager = getManager();
  async addview(type:string, type_id:number, user_id: number) {
    var checkType;
    if (type == 'reels')
      checkType = `select * from reels where id=${type_id}`
    else if (type == 'posts')
      checkType = `select * from posts where id=${type_id}`
    else if (type == 'stories')
      checkType = `select * from stories where id=${type_id}`
    else if (type == 'nfts')
      checkType = `select * from nfts where id=${type_id}`
    const checkTypedata=await this.queryManager.query(checkType)
    if (checkTypedata?.length <= 0) {
      return {
        data: false,
        message: `${type} Not Found`
      }
    }
    const checkCommentQuery = `select * from views where 
    type='${type}' and type_id=${type_id} 
    and "authorId"=${user_id}`;
    const checkData = await this.queryManager.query(checkCommentQuery);
    if (checkData?.length > 0) {
      return {
        status: 200,
        data: true,
        message: "Alredy viewed"
      }
    }
    else {
      const inserQuery = `INSERT INTO views(type, type_id, "authorId")
	                  VALUES ('${type}', ${type_id}, ${user_id});`
        await this.queryManager.query(inserQuery)
          .then((res) => {
            let total_view;
            if (type =='reels')
              total_view = `update reels set total_view=total_view+1 where id=${type_id}`
            else if (type == 'posts')
              total_view = `update posts set total_view=total_view+1 where id=${type_id}`
            else if (type == 'stories')
              total_view = `update stories set total_view=total_view+1 where id=${type_id}`
            else if (type == 'nfts')
              total_view = `update nfts set total_view=total_view+1 where id=${type_id}`
            this.queryManager.query(total_view)
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
          data:true,
          message: "View Added"
        }
    }
  }
  async checkView(type: string, type_id: number, user_id: number) {
    const checkViewQuery = `select * from views where 
    type='${type}' and type_id=${type_id} 
    and "authorId"=${user_id}`;
    const checkData = await this.queryManager.query(checkViewQuery);
    if (checkData?.length > 0) {
      return {
        status: 200,
        data:true
      }
    }
    else {
      return {
        status: 200,
        data: false
      }
    }
  }

  async listView(type: string, type_id: number) {
    const user = await this.viewRepository
      .createQueryBuilder("views")
      .select('')
      .leftJoin('views.author', 'user')
      .addSelect(['user.username', "user.id", "user.profile_photo"])
      .where(`views.type=:type`, {
        type: type,
      })
      .andWhere(`views.type_id=:type_id`, {
        type_id: type_id,
      })
      .getMany();
      console.log(user);
    if (user?.length > 0) {
      return {
        statusCode: 200,
        data: user
      }
    }
    else {
      return {
        statusCode: 404,
        message: 'User not found',
      };
    }
  }

}
