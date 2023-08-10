import { CoreEntityT } from 'src/common/entities/core.entity';
import { UserSchema } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('content_collection')
export class ContentCollectionSchema extends CoreEntityT {

    @ManyToOne(() => UserSchema, (author: UserSchema) => author.content_collection, {
        cascade: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn()
    author: UserSchema;

    @Column({ nullable: true })
    type_id: number;

    @Column()
    type: string;
}
