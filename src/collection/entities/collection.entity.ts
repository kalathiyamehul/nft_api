import { CoreEntity, CoreEntityT } from "src/common/entities/core.entity";
import { HashTagSchema } from "src/hashtag/entities/hashtag.entity";
import { LikesSchema } from "src/like/entities/like.entity";
import { NftSchema } from "src/nft/entities/nft.entity";
import { UserSchema } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany } from "typeorm";

export class Collection extends CoreEntity {
    active: boolean;
    collection_name: string;
    collection_cover_image: string;
    collection_logo_image: string;
    author: UserSchema;
    number_of_nfts: number
}

@Entity('collection')
export class CollectionSchema extends CoreEntityT {

    @Column({
        default: true,
    })
    active: boolean;

    @Column({
        default: true,
    })
    is_trending: boolean;

    @Column({})
    collection_name: string;

    @Column({ nullable: true })
    collection_address: string;

    @Column({ nullable: true })
    collection_symbol: string;

    @Column({ nullable: true })
    metmask_link: string;

    @Column({ nullable: true, default: false })
    metmask_created: boolean;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    category: string;

    @Column({ nullable: true, default: 0 })
    total_like: number

    @Column({ nullable: true, default: 0 })
    total_double_like: number

    @Column({ nullable: true })
    total_bookmark: number

    @Column({ nullable: true })
    collection_cover_image: string;

    @Column({ nullable: true })
    collection_logo_image: string;

    @Column({ nullable: true, default: false })
    is_publish_to_public: boolean

    @Column({ nullable: true, default: 0 })
    total_value: number

    @Column({
        nullable: true
    })
    cryptoType: string;

    @ManyToOne(() => UserSchema, (user: UserSchema) => user.collections, {
        nullable: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn()
    author?: UserSchema;

    @Column({ nullable: true })
    number_of_nfts: number;

    @ManyToMany(() => NftSchema, (nft: NftSchema) => nft.collection, {
        eager: true
    })
    nfts: NftSchema[];

    @OneToMany(() => HashTagSchema, (hashtag) => hashtag.collection, {
        eager: true,
        nullable: true,
    })
    hashtag: HashTagSchema[];

}
