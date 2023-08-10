import { CoreEntityT } from 'src/common/entities/core.entity';
import { NftModel, NftSchema } from 'src/nft/entities/nft.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

export class FavoriteModel {
    nft: NftModel;
}

@Entity('favorite')
export class FavoriteSchema extends CoreEntityT {

    @ManyToOne(() => NftSchema, (nft: NftSchema) => nft.favorites, {
        cascade: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn()
    nft: NftSchema;
}