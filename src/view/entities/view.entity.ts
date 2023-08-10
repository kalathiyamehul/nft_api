import { CoreEntityT } from 'src/common/entities/core.entity';
import { UserSchema } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('views')
export class ViewsSchema extends CoreEntityT {

    @ManyToOne(() => UserSchema, (author: UserSchema) => author.views, {
        cascade: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn()
    author: UserSchema;

    @Column({ nullable: true })// Reels ID, Post ID, Story ID
    type_id: number;

    @Column() // Reels, Post, Story
    type: string;
}
