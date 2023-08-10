import { CoreEntityT } from "src/common/entities/core.entity";
import { UserSchema } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export class Story { }


@Entity('stories')
export class StorySchema extends CoreEntityT {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    latitude: string;

    @Column({ nullable: true })
    longitude: string;

    @Column({ nullable: true })
    image_url: string;

    @Column({ nullable: true })
    caption: string;

    @Column({ nullable: true, default: 0 })
    total_view: number

    @Column({
        nullable: true,
        default: 'Active'
    })
    status: string;

    @ManyToOne(() => UserSchema, (userSchema: UserSchema) => userSchema.stories, {
        cascade: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn()
    author: UserSchema;
}