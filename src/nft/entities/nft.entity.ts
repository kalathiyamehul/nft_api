import { AuctionSchema } from 'src/auctions/entities/auction.entity';
import { BidSchema } from 'src/bid/entities/bid.entity';
import { CategorySchema } from 'src/categories/entities/category.entity';
import { CollectionSchema } from 'src/collection/entities/collection.entity';
import { CoreEntity, CoreEntityT } from 'src/common/entities/core.entity';
import { FavoriteModel, FavoriteSchema } from 'src/favorite/entities/favorite.entity';
import { HashTagSchema } from 'src/hashtag/entities/hashtag.entity';
import { LikesSchema } from 'src/like/entities/like.entity';
import { UserSchema } from 'src/users/entities/user.entity';
import { NftHistorySchema } from 'src/nft/entities/nftHistory.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne } from 'typeorm';

function formatDate(date: Date) {
    var d = date,
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

export enum cryptoType {
    ETH = 'ETH',
    BTC = 'BTC',
    ADA = 'ADA',
    BNB = 'BNB',
    USDT = 'USDT',
    SOL = 'SOL',
    XRP = 'XRP',
    null = '',
}

export class NftModel extends CoreEntity {
    name: string;
    description: string;
    cryptoCost?: string;
    cryptoType: cryptoType;
    size: string;
    slug: string;
    collectionName: string;
    auctionEnds: Date;
    itemOwner: string;
    itemOwnerPhoto: string;
    auctionImg: string;
    favorites:FavoriteModel
}
export class Attribtes {
    trait_type: string;
    value: string
}
@Entity('nfts')
export class NftSchema extends CoreEntityT {

    @Column({})
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    cryptoCost: string;

    @Column({ nullable: true, default: false })
    auction_iscreated: boolean;

    @Column({
        nullable: true
    })
    cryptoType: string;

    @Column({ nullable: true })
    size: string;

    @Column({ nullable: true })
    slug: string;

    @Column({ default: formatDate(new Date()) })
    auctionEnds: Date;

    @ManyToOne(() => UserSchema, (user: UserSchema) => user.nftOwner, {
        cascade: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn()
    owner: UserSchema;
    
    @Column({ nullable: true })
    auctionImg: string;

    @Column({ nullable: true })
    unique_string: string;

    @Column({ nullable: true })
    image_url: string;

    @Column({ default: false })
    nft_is_minted: boolean;

    @Column({ default: false })
    generateFromGame: boolean;
    
    @Column({ nullable: true, default: 0 })
    total_like: number

    @Column({ nullable: true, default: 0 })
    total_double_like: number

    @Column({ nullable: true })
    edition: string;

    @Column({ nullable: true })
    browser_signature: string

    @Column({ nullable: true })
    service_fee: number
    
    @Column({ nullable: true })
    royalties: number

    @Column('jsonb', { nullable: true })
    attributes: Attribtes[];

    @OneToMany(() => FavoriteSchema, (fav) => fav.nft, {
        eager: true,
        nullable: true,
    })
    favorites: FavoriteSchema[];

    @OneToMany(() => HashTagSchema, (hashtag) => hashtag.nft, {
        eager: true,
        nullable: true,
    })
    hashtag: HashTagSchema[];

    @ManyToOne(() => AuctionSchema, (auction: AuctionSchema) => auction.nfts, {
        nullable: true
    })
    @JoinColumn()
    auction: AuctionSchema;

    @Column({ nullable: true, default: 0 })
    final_value: number

    @ManyToMany(() => CollectionSchema, (nft: CollectionSchema) => nft.nfts, {
        cascade: true,
    })
    @JoinTable()
    collection: CollectionSchema[];

    @OneToMany(() => BidSchema, (bid: BidSchema) => bid.nft, {
        nullable: true,
        cascade: true,
        eager: true
    })
    bids: BidSchema[];

    

    @Column({ nullable: true ,default:0})
    total_bookmark: number

    @ManyToOne(() => UserSchema, (nft: UserSchema) => nft.nfts, {
        cascade: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn()
    author: UserSchema;

    @OneToMany(() => NftHistorySchema, (nfthistory) => nfthistory.nft, {
        nullable: true,
    })
    nfthistorys: NftHistorySchema[];

    @Column({ nullable: true, default: 0 })
    total_view:number
}
