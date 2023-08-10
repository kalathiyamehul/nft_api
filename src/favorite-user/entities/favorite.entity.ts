import { CoreEntityT } from 'src/common/entities/core.entity';
import { UserSchema } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('favorite_user')
export class FavoriteSchema extends CoreEntityT {

    @ManyToOne(() => UserSchema, (author: UserSchema) => author.favorites, {
        cascade: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn()
    author: UserSchema;

    @Column()
    request_from: string;
    
    @Column()
    user_id: number;

}
