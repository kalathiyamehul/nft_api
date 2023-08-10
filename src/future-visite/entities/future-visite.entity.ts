import { CoreEntityT } from "src/common/entities/core.entity";
import { UserSchema } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

export class FutureVisite { }


@Entity('futurevisite')
export class FutureVisiteSchema extends CoreEntityT {

    @Column({ nullable: true })
    latitude: string;

    @Column({ nullable: true })
    longitude: string;


    @Column({ nullable: true })
    priority: string;

    @Column({ nullable: true })
    expected_date: Date;

    @ManyToOne(() => UserSchema, (userSchema: UserSchema) => userSchema.futurevisites, {
        cascade: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn()
    author: UserSchema;
}