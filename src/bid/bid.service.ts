import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuctionSchema } from 'src/auctions/entities/auction.entity';
import { NftSchema } from 'src/nft/entities/nft.entity';
import { UserSchema } from 'src/users/entities/user.entity';
import { getConnection, getManager, getRepository, Repository } from 'typeorm';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { BidSchema } from './entities/bid.entity';

@Injectable()
export class BidService {

  constructor(@InjectRepository(BidSchema) private bidRepository: Repository<BidSchema>,
  ) { }

  userRepository = getRepository(UserSchema)
  nftRepository = getRepository(NftSchema)
  auctionRepository = getRepository(AuctionSchema)

  async create(createBidDto: CreateBidDto, id: number) {

    const auction = await this.auctionRepository
      .createQueryBuilder('auctions')
      .leftJoin('auctions.nfts', 'nfts')
      .addSelect(['nfts.id', "nfts.name",
        "nfts.image_url", "nfts.auction_iscreated", "nfts.nft_is_minted"])
      .where(`auctions.id=:auctionId`, {
        auctionId: createBidDto?.auction_id,
      })
      .getOne();

    if (auction?.highest_bid) {
      if (auction?.highest_bid >= createBidDto?.cryptoCost) {
        throw new BadRequestException('Place Bid more than heigest bid.').getResponse();
      }
    }
    const user = await this.userRepository
      .createQueryBuilder('users')
      .where(`users.id=:userId`, {
        userId: id,
      })
      .getOne();

    const nft = await this.nftRepository
      .createQueryBuilder('nfts')
      .where(`nfts.id=:id`, {
        id: auction?.nfts[0]?.id,
      })
      .getOne();

    if (!auction?.highest_bid) {
      await this.auctionRepository.update({ id: +createBidDto?.auction_id }, {
        highest_bid: +createBidDto?.cryptoCost
      })
    }
    else if (auction?.highest_bid < createBidDto?.cryptoCost) {
      await this.auctionRepository.update({ id: +createBidDto?.auction_id }, {
        highest_bid: +createBidDto?.cryptoCost
      })
    }
    await this.bidRepository.save({
      cryptoCost: createBidDto?.cryptoCost,
      cryptoType: createBidDto?.cryptoType,
      author: user,
      auction: auction,
      created_by: user?.username,
      created_user_photo: user?.profile_photo,
      nft: nft
    })
    return {
      message: "Bid Added",
      status: 200
    }
  }

  findAll() {
    return `This action returns all bid`;
  }

  async findOneByNftId(id: number) {
    const nft = await this.nftRepository.findOne({ id: id });
    const bids = await this.bidRepository.find({ nft: nft })
    return bids;
  }

  update(id: number, updateBidDto: UpdateBidDto) {
    return `This action updates a #${id} bid`;
  }

  remove(id: number) {
    return `This action removes a #${id} bid`;
  }
}
