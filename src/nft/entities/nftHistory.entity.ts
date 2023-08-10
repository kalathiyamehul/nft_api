import { CoreEntity, CoreEntityT } from 'src/common/entities/core.entity';
import { UserSchema } from 'src/users/entities/user.entity';
import { NftSchema } from 'src/nft/entities/nft.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne } from 'typeorm';

export class NftHistoryModel extends CoreEntity {
    description: string;
}
@Entity('nfts_history')
export class NftHistorySchema extends CoreEntityT {

    @Column({ nullable: true })
    description: string;
    
    @ManyToOne(() => UserSchema, (nfthistory: UserSchema) => nfthistory.usernfthistorys, {
        cascade: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn()
    author: UserSchema;

    @ManyToOne(() => NftSchema, (nfthistory: NftSchema) => nfthistory.nfthistorys, {
        cascade: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn()
    nft: NftSchema;
}
