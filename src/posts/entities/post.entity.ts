import { CoreEntityT } from 'src/common/entities/core.entity';
import { UserSchema } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

export class TaggedUsers {
    id: number;
    name: string;
    profile_picture: string;
}

@Entity('posts')
export class PostsSchema extends CoreEntityT {

    @Column()
    file_url: string;

    @Column({ nullable: true })
    file_type: string;

    @Column({ nullable: true })
    duration: number;

    @Column({ nullable: true })
    thumbnail_url: string;

    @Column()
    description: string;

    @Column({ nullable: true, default: 0 })
    total_like: number

    @Column({ nullable: true, default: 0 })
    total_view: number

    @Column({ nullable: true, default: 0 })
    total_comment: number

    @Column('jsonb', { nullable: true })
    tagged_users: TaggedUsers[];

    @ManyToOne(() => UserSchema, (user: UserSchema) => user.posts, {
        nullable: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn()
    author?: UserSchema;

    @Column({ nullable: true, default: '' })
    source: string

    @Column({ nullable: true, default: '' })
    location: string

    @Column({ nullable: true, default: 'everyone' })
    postVisibility: string
}


@Entity('post_hide')
export class PostHideSchema extends CoreEntityT {

    @ManyToOne(() => UserSchema, (author: UserSchema) => author.post_hide, {
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