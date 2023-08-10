import { BidSchema } from 'src/bid/entities/bid.entity';
import { CoreEntityT } from 'src/common/entities/core.entity';
import { NftSchema } from 'src/nft/entities/nft.entity';
import { UserSchema } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';


@Entity('auctions')
export class AuctionSchema extends CoreEntityT {

    @Column({})
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    auctionImage: string;

    @Column({ nullable: true })
    auctionDate: Date;

    @Column({ nullable: true })
    start_bid: number;

    @Column({ nullable: true })
    highest_bid: number;

    @Column({
        nullable: true
    })
    cryptoType: string;

    @OneToMany(() => NftSchema, (nft: NftSchema) => nft.auction, {
        eager: true,
    })
    nfts: NftSchema[];

    @ManyToOne(() => UserSchema, (Auction: UserSchema) => Auction.auctions, {
        cascade: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn()
    author: UserSchema;

    @OneToMany(() => BidSchema, (bid: BidSchema) => bid.auction, {
        nullable: true,
        cascade: true,
        eager: true
    })
    bids: BidSchema[];

}
