import { CoreEntityT } from "src/common/entities/core.entity";
import { UserSchema } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity('comment')
export class CommentSchema extends CoreEntityT {

    @Column({ nullable: true })
    type: string;

    @Column({ nullable: true })
    comment: string;

    @Column({ nullable: true })
    type_id: number;

    @ManyToOne(() => UserSchema, {
        cascade: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn()
    author: UserSchema;
}