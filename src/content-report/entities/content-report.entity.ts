import { CoreEntityT } from 'src/common/entities/core.entity';
import { UserSchema } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('content_report')
export class ContentReportSchema extends CoreEntityT {

    @ManyToOne(() => UserSchema, (author: UserSchema) => author.content_report, {
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
   
    @Column()
    category: string;
}
