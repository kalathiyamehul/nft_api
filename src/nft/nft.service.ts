import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, getRepository, Repository } from 'typeorm';
import { CreateNftAppDto, CreateNftDBDto, CreateNftDto, GetNftQueryDto } from './dto/create-nft.dto';
import { NftSchema } from './entities/nft.entity';
import { NftHistorySchema } from './entities/nftHistory.entity';
import fs from 'fs'
import generator from "../genertor"
import { S3Service } from './s3.service';
import { UpdateNftDto } from './dto/update-nft.dto';
import { getManager } from "typeorm"
import { UserSchema } from 'src/users/entities/user.entity';
import { CollectionSchema } from 'src/collection/entities/collection.entity';
@Injectable()
export class NftService {

  constructor(@InjectRepository(NftSchema) private nftReository: Repository<NftSchema>,
    private s3Service: S3Service) { }

  userRepository = getRepository(UserSchema);
  NftHistoryRepository = getRepository(NftHistorySchema);
  collectionRepository = getRepository(CollectionSchema);
  entityManager = getManager()

  async generateNft(generate_dto: CreateNftDBDto, id: number) {
    let user: any;;
    if (id) {
      user = await this.userRepository.findOne({ id: id })
      generate_dto.author = user;
    }
    const edition = await this.nftReository.count();
    const returnData = await generator.startCreatingOneNft(generate_dto, edition)

    // let rowdata = [];
    // let query = `SELECT * FROM nfts where nft_is_minted=false`;
    // query += user.sendNfts != undefined ? ` and  id not in (${user.sendNfts})` : ``
    // query += ` OFFSET floor(random() * (SELECT COUNT(*) FROM nfts)) LIMIT 1`

    // for (let i = 0; i < 10; i++) {
    //   rowdata = await this.entityManager.query(query)
    //   if (rowdata.length > 0)
    //     break;
    // }
    // if (rowdata.length > 0) {

    //   let sendNftsinal = '';
    //   if (user?.sendNfts == undefined)
    //     sendNftsinal = `${rowdata[0].id}`;
    //   else
    //     sendNftsinal = user.sendNfts + `,${rowdata[0].id}`;

    //   await this.userRepository.update({ id: id }, {
    //     sendNfts: sendNftsinal
    //   })
    //   await this.nftReository.update({ id: rowdata[0].id }, {
    //     author: user,
    //   })
    //   return {
    //     "message": "Charecture Generate Succsesfully",
    //     "status_code": 200,
    //     image_url: rowdata[0]?.image_url,
    //     date: new Date(),
    //     ...rowdata[0]
    //   };
    // }
    if (returnData.success) {
      const s3Data = await this.s3Service.uploadFile(edition);
      fs.unlink(`${edition}.png`, (err) => { console.log(err) })

      if (s3Data?.statusCode === 0) {
        return {
          "message": s3Data?.message,
          "statusCode": 400,
        };
      }

      const dbData = await this.nftReository.save({
        ...returnData?.data,
        image_url: s3Data.Location,
        generateFromGame: true,
        created_by: user?.username,
        author: user,
        browser_signature: generate_dto?.browser_signature,
        created_user_photo: user?.profile_photo
      })
      const colletion = await this.collectionRepository.findOne({ collection_name: generate_dto?.collection_id })

      await getConnection()
        .createQueryBuilder()
        .relation(NftSchema, 'collection')
        .of(dbData)
        .add(colletion);

      await this.collectionRepository.update({ id: colletion?.id }, { number_of_nfts: colletion?.number_of_nfts + 1 })


      let sendNftsinal = '';
      if (user?.sendNfts == undefined)
        sendNftsinal = `${dbData.id}`;
      else
        sendNftsinal = user.sendNfts + `,${dbData.id}`;

      await this.userRepository.update({ id: id }, {
        sendNfts: sendNftsinal
      })

      return {
        "message": "Avatar Generate Succsesfully",
        "status_code": 200,
        image_url: s3Data?.Location,
        id: dbData?.id,
        date: new Date(),
        ...returnData?.data
      };
    }
    else {
      return {
        "message": "Avatar Generate falied.",
        "status_code": 500,
      };
    }

  }

  async save_nft(nftDto: CreateNftDBDto, id: number) {
    let user = await this.userRepository.findOne({ id: id })
    nftDto.author = user;
    const data = await this.nftReository.save({ ...nftDto })
    return {
      "message": "Update Succsesfully",
      "data": data
    };;
  }

  async create_new_nft(createNftAppDto: CreateNftAppDto, id: number) {

    let user = await this.userRepository.findOne({ id: id })
    let Create_nft = new NftSchema();
    Create_nft.author = user;
    Create_nft.owner = user;
    Create_nft.name = createNftAppDto.name;
    Create_nft.description = createNftAppDto.description;
    Create_nft.image_url = createNftAppDto.image_url;
    Create_nft.cryptoCost = createNftAppDto.cryptoCost;
    Create_nft.cryptoType = createNftAppDto.cryptoType;
    Create_nft.service_fee = createNftAppDto.service_fee;
    Create_nft.royalties = createNftAppDto.royalties;
    const data = await this.nftReository.save(Create_nft)
    return {
      "message": "Saved Succsesfully",
      "data": data
    };;
  }

  async update_nft(id: number, nftDto: UpdateNftDto, userId: number) {
    const nft = await this.nftReository.findOne({ id: id });
    if (nft) {
      if (nftDto?.total_like) {
        nftDto.total_like = nft?.total_like + nftDto.total_like;
        if (nftDto.total_like <= -1)
          nftDto.total_like = 0
      }
      if (nftDto?.total_bookmark) {
        nftDto.total_bookmark = nft?.total_bookmark + nftDto.total_bookmark;
        if (nftDto.total_bookmark <= -1)
          nftDto.total_bookmark = 0
      }

      //Save NFT History
      if (nftDto?.nft_is_minted) {
        let user: any;
        console.log(userId);
        if (userId) {
          user = await this.userRepository.findOne({ id: userId })
        }
        const data = await this.NftHistoryRepository.save({
          description: "NFT minted",
          nft: nft,
          author: user
        })
      }
      // await this.nftReository.update({ id: id }, { ...nftDto, updated_at: new Date() })
      return {
        "message": "Update Succsesfully",
        "status_code": 200,
      };
    }
    else {
      throw new NotFoundException("Nft Not found").getResponse()
    }
  }

  async buildSetup() {
    generator.buildSetup();
    return { "message": "Done" };
  }

  async find(query: GetNftQueryDto) {
    // const nfts = await this.nftReository
    //   .createQueryBuilder("nfts")
    //   .leftJoinAndSelect('nfts.author', 'author')
    //   .limit(query?.limit ? query?.limit : 10)
    //   // .orderBy("nfts.created_at", "DESC")
    //   .getMany();
    var sqlquery = `select * from nfts order by id desc`;
    sqlquery += query?.limit ? ` limit ${query?.limit}` : ``;
    console.log(sqlquery)
    const nfts = await this.entityManager.query(sqlquery)
    return nfts;
  }

  async getTrandingNft(query: GetNftQueryDto, user_id: number) {
    let page = 1;
    if (query?.page && query?.page > 0) { page = query?.page }
    const limit = +process.env?.NFT_LIMIT;
    const offset = (page - 1) * limit;
    const nfts = await this.nftReository
      .createQueryBuilder("nfts")
      .leftJoin('nfts.author', 'author')
      .addSelect(['author.username', "author.id", "author.profile_photo"])
      // .where(`nfts."authorId" <> ${user_id}`)
      .offset(offset)
      .limit(limit)
      .orderBy("nfts.created_at", "DESC")
      .getMany();
    // var sqlquery = `select * from nfts order by id desc`;
    // sqlquery += query?.limit ? ` limit ${query?.limit}` : ``;
    // const nfts = await this.entityManager.query(sqlquery)
    return nfts;
  }
  async getLatestNft(userId: number) {
    let watchedNFT = [];
    const nfts = await this.nftReository
      .createQueryBuilder("nfts")
      .leftJoin('nfts.author', 'author')
      .addSelect(['author.username', "author.id", "author.profile_photo"])
      .where(`nfts.id NOT IN (select type_id from views where views.type = 'nfts' and views."authorId" = ${userId})`)
      .limit(5)
      .orderBy("nfts.created_at", "DESC")
      .getMany();
    if (nfts.length < 5) {
      watchedNFT = await this.nftReository
        .createQueryBuilder("nfts")
        .leftJoin('nfts.author', 'author')
        .addSelect(['author.username', "author.id", "author.profile_photo"])
        .limit(5 - nfts.length)
        .orderBy("nfts.created_at", "DESC")
        .getMany();
    }
    return nfts.concat(watchedNFT);
  }
  async findByAuthorID(page: number, user_id: number) {
    if (!page || Number.isNaN(page) || page == 0) { page = 1 }
    const limit = +process.env?.NFT_LIMIT;
    const offset = (page - 1) * limit;
    const nfts = await this.nftReository
      .createQueryBuilder("nfts")
      .leftJoin('nfts.author', 'author')
      .addSelect(['author.username', "author.id", "author.profile_photo"])
      .where(`CAST(nfts.authorId as varchar) LIKE :id`, {
        id: ((!Number.isNaN(user_id) && user_id > 0) ? `${user_id}` : `%`),
      })
      .offset(offset)
      .limit(limit)
      .orderBy("nfts.created_at", "DESC")
      .getMany();
    return nfts;
  }
  async findOneById(id: number) {
    const nfts = await this.nftReository
      .createQueryBuilder("nfts")
      .leftJoin('nfts.author', 'author')
      .addSelect(['author.username', "author.id", "author.profile_photo"])
      .leftJoin('nfts.owner', 'owner')
      .addSelect(['owner.username', "owner.id", "owner.profile_photo"])
      .leftJoin('nfts.collection', 'collection')
      .addSelect(['collection.collection_name', "collection.id",
        "collection.collection_cover_image", "collection.collection_logo_image"
        , "collection.category", "collection.collection_address"])
      .leftJoin('collection.nfts', 'collectionnfts')
      .addSelect([
        'collectionnfts.id',
        'collectionnfts.name',
        'collectionnfts.image_url',
        'collectionnfts.auction_iscreated',
        'collectionnfts.nft_is_minted',
        'collectionnfts.final_value',
        'collectionnfts.total_like',
      ])
      .leftJoin('nfts.bids', 'bids')
      .addSelect(['bids.id', "bids.cryptoType",
        "bids.cryptoCost", "bids.created_by", "bids.created_user_photo"])
      .leftJoin('nfts.nfthistorys', 'nfts_history')
      .addSelect(['nfts_history.description', "nfts_history.created_at"])
      .leftJoin('nfts_history.author', 'user')
      .addSelect(['user.username', "user.id", "user.profile_photo"])
      .where(`nfts.id=:id`, {
        id: id,
      })
      .getOne();
    return nfts;
  }
  async getTrendingArtwork() {
    const rowdata = await this.entityManager.query(`
    select n.*,u.profile_photo,u.username as created_by from nfts as n,users as u where total_like 
    is not null and total_bookmark is not null and n."authorId"=u.id 
    order by total_like desc,total_bookmark desc limit 6`)
    return rowdata;
  }

  async delete(id: number) {
    const data = await this.nftReository.findOne({ id: id })
    if (data) {
      await this.nftReository.remove(data)
    }
    return data;
  }
  async getFeaturedArtwork() {
    const rowdata = await this.entityManager.query(`
    select * from nfts where "auctionEnds">=now() limit 4`)
    return rowdata;
  }

}
