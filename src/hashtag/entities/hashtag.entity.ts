import { CollectionSchema } from 'src/collection/entities/collection.entity';
import { CoreEntityT } from 'src/common/entities/core.entity';
import { NftSchema } from 'src/nft/entities/nft.entity';
import { ReelsSchema } from 'src/reels/entities/reel.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

@Entity('hashtag')
export class HashTagSchema extends CoreEntityT {
    @ManyToOne(() => NftSchema, (nft: NftSchema) => nft.hashtag, {
        cascade: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn()
    nft: NftSchema;

    @ManyToOne(() => CollectionSchema, (nft: CollectionSchema) => nft.hashtag, {
        cascade: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn()
    collection: CollectionSchema;

    @ManyToOne(() => ReelsSchema, (nft: ReelsSchema) => nft.hashtag, {
        cascade: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn()
    reel: ReelsSchema;

    @Column()
    entity_type: number;
}

@Entity('hashtags')
export class HashTagsSchema extends CoreEntityT {
    @Column()
    hashtag: string;
}