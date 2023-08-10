import { AuctionSchema } from 'src/auctions/entities/auction.entity';
import { BidSchema } from 'src/bid/entities/bid.entity';
import { CollectionSchema } from 'src/collection/entities/collection.entity';
import { CoreEntity, CoreEntityT } from 'src/common/entities/core.entity';
import { NftSchema } from 'src/nft/entities/nft.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';

export class SubscriberModle extends CoreEntity {
  subscribe: boolean;
  email: string;
  description: string;
}

@Entity('subscribers')
export class SubscriberSchema extends CoreEntityT {
  @Column({
    default: true,
  })
  subscribe: boolean;

  @Column({
    unique: true,
  })
  email: string;

  @Column({ nullable: true })
  description: string;
}
