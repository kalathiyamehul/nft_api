export class Category {}

import { CoreEntityT } from 'src/common/entities/core.entity';
import { NftModel, NftSchema } from 'src/nft/entities/nft.entity';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';

export class CategoryModel {
    nft: NftModel;
}

@Entity('category')
export class CategorySchema extends CoreEntityT {

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    slug: string;

}