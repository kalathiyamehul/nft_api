import { CoreEntityT } from "src/common/entities/core.entity";
import { UserSchema } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

export class Illustration { }


@Entity('illustration')
export class IllustrationSchema extends CoreEntityT {

    @Column({ nullable: true })
    latitude: string;

    @Column({ nullable: true })
    longitude: string;

    @Column({ nullable: true })
    actual_latitude: string;

    @Column({ nullable: true })
    actual_longitude: string;

    @ManyToOne(() => UserSchema, (userSchema: UserSchema) => userSchema.illustrations, {
        cascade: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn()
    author: UserSchema;
}