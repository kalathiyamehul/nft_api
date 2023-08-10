import { AuctionSchema } from 'src/auctions/entities/auction.entity';
import { CoreEntityT } from 'src/common/entities/core.entity';
import { NftModel, NftSchema } from 'src/nft/entities/nft.entity';
import { UserSchema } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

export class BidModel {
    nft: NftModel;
}

@Entity('bids')
export class BidSchema extends CoreEntityT {

    @Column({ nullable: true })
    cryptoCost: number;

    @Column({ nullable: true })
    cryptoType: string;

    @Column({ nullable: true })
    created_by: string;

    @Column({ nullable: true })
    created_user_photo: string;

    @ManyToOne(() => NftSchema, (nft: NftSchema) => nft.bids, {
        nullable: true,
    })
    @JoinColumn()
    nft: NftSchema;

    @ManyToOne(() => AuctionSchema, (nft: AuctionSchema) => nft.bids, {
        nullable: true,
    })
    @JoinColumn()
    auction: AuctionSchema;

    @ManyToMany(() => UserSchema, (user: UserSchema) => user.bids)
    @JoinTable()
    users: UserSchema[];


}
