import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GetNftQueryDto } from 'src/nft/dto/create-nft.dto';
import { NftSchema } from 'src/nft/entities/nft.entity';
import { UserSchema } from 'src/users/entities/user.entity';
import {
  getConnection,
  getManager,
  getRepository,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { CreateAuctionDto, EditAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { AuctionSchema } from './entities/auction.entity';

@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(AuctionSchema)
    private auctionRepository: Repository<AuctionSchema>,
  ) { }

  userRepository = getRepository(UserSchema);
  nftRepository = getRepository(NftSchema);
  entityManager = getManager();

  async create(createAuctionDto: any, id: number) {
    const nft = createAuctionDto['nfts'];
    const nft_data = await this.nftRepository.findOne({ id: +nft });
    if (nft_data) {
      delete createAuctionDto['nfts'];
      const user = await this.userRepository.findOne({ id: id });
      const data = await this.auctionRepository.save({
        ...createAuctionDto,
        author: user,
        created_by: user?.username,
        auctionImage: nft_data?.image_url,
        created_user_photo: user?.profile_photo,
      });
      if (nft) {
        await this.nftRepository.update(
          { id: +nft },
          {
            auction: data,
            auction_iscreated: true,
          },
        );
      }
      return data;
    }
    else {
      throw new NotFoundException('NFT not found').getResponse();
    }
  }

  async update(editAuctionDto: any, id: number) {
    const auctionId = editAuctionDto['id'];
    if (id) {
      if (auctionId) {
        const user = await this.userRepository
          .createQueryBuilder('users')
          .where(`users.id=:userId`, {
            userId: id,
          })
          .getOne();

        const auction = await this.auctionRepository
          .createQueryBuilder('auctions')
          .leftJoinAndSelect('auctions.author', 'author')
          .leftJoinAndSelect('auctions.nfts', 'nfts')
          .where(`auctions.id=:auctionId`, {
            auctionId: editAuctionDto.id,
          })
          .getOne();

        if (user.id === auction.author.id) {

          auction.name = editAuctionDto?.name;
          auction.description = editAuctionDto?.description;
          auction.auctionDate = editAuctionDto?.auctionDate;
          auction.start_bid = editAuctionDto?.start_bid;

          let updatedAuction = await this.auctionRepository.save(auction);
          console.log('updatedAuction', updatedAuction);

          return {
            statusCode: 201,
            message: 'update done',
          };
        }

        throw new BadRequestException({
          statusCode: 400,
          message: 'You do not have sufficient permission',
        }).getResponse();
      }
    }

    throw new UnauthorizedException({
      statusCode: 401,
      message: 'please logged in',
    }).getResponse();
  }

  async findAll() {
    const collection = await this.auctionRepository
      .createQueryBuilder('auctions')
      .leftJoinAndSelect('auctions.author', 'author')
      .leftJoinAndSelect('auctions.bids', 'bids')
      .where(`auctions.auctionDate > :created_at`, {
        created_at: new Date().toLocaleString(),
      })
      .getMany();

    // const data = await this.auctionRepository.find({
    //   where: {
    //     auctionDate: MoreThan(`${new Date().toLocaleString().split(',')[0]}`),
    //   },
    // });
    return collection;
  }
  async getTrandingAuction(query: GetNftQueryDto, user_id: number) {
    let page = 1;
    if (query?.page && query?.page > 0) { page = query?.page }
    const limit = +process.env?.NFT_LIMIT;
    const offset = (page - 1) * limit;
    const collection = await this.auctionRepository
      .createQueryBuilder('auctions')
      .leftJoin('auctions.author', 'author')
      .addSelect(['author.username', "author.id", "author.profile_photo"])
      .leftJoinAndSelect('auctions.bids', 'bids')
      // .where(`auctions."authorId" <> ${user_id}`)
      .offset(offset)
      .limit(limit)
      .where(`auctions.auctionDate > :created_at`, {
        // created_at: new Date().toLocaleString(), // Remove because of the ERROR: date/time field value out of range
        created_at: new Date(),
      })
      .getMany();

    // const data = await this.auctionRepository.find({
    //   where: {
    //     auctionDate: MoreThan(`${new Date().toLocaleString().split(',')[0]}`),
    //   },
    // });
    return collection;
  }

  async getUserAuctions(id: number) {
    const user = await this.userRepository.findOne({ id: id });
    const auctions = await this.auctionRepository.find({ author: user });
    if (auctions) {
      return auctions;
    } else throw new NotFoundException('Acution Not found').getResponse();
  }

  async findOne(id: number) {
    const auction = await this.auctionRepository
      .createQueryBuilder('auctions')
      .leftJoin('auctions.author', 'author')
      .addSelect(['author.id', "author.username", "author.profile_photo"])
      .leftJoin('auctions.nfts', 'nfts')
      .addSelect(['nfts.id', "nfts.name",
        "nfts.image_url", "nfts.auction_iscreated", "nfts.nft_is_minted"])
      .leftJoin('auctions.bids', 'bids')
      .addSelect(['bids.id', "bids.cryptoType",
        "bids.cryptoCost", "bids.created_by", "bids.created_user_photo"])
      .where(`auctions.id=:auctionId`, {
        auctionId: id,
      })
      .getOne();
    if (auction) {
      return auction;
    } else throw new NotFoundException('Auction Not found').getResponse();
  }

  remove(id: number) {
    return `This action removes a #${id} auction`;
  }
}
