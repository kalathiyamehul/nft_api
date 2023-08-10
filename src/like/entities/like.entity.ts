import { CoreEntityT } from 'src/common/entities/core.entity';
import { UserSchema } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('likes')
export class LikesSchema extends CoreEntityT {

    @ManyToOne(() => UserSchema, (author: UserSchema) => author.likes, {
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

    @Column({ default: false, nullable: true })
    double_like: boolean;

}
