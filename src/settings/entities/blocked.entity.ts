import { CoreEntityT } from 'src/common/entities/core.entity';
import { Column, Entity, OneToOne } from 'typeorm';
import { UserSchema } from '../../users/entities/user.entity';


@Entity('user_blocked')
export class BlockedSchema extends CoreEntityT {
    @Column()
    blocked_user_id: number;//3

    @Column()
    blocker_user_id: number; //2

    //here user 2 is blocking user 3
}

@Entity('user_restrict')
export class RestrictSchema extends CoreEntityT {
    @Column()
    restricted_user_id: number;//3

    @Column()
    restricter_user_id: number; //2

    //here user 2 is restrict user 3
}


@Entity('user_mute')
export class MutedSchema extends CoreEntityT {
    @Column()
    muted_user_id: number;//3

    @Column()
    muter_user_id: number; //2

    //here user 2 is muting user 3
}