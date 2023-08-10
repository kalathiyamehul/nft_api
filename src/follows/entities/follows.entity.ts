import { CoreEntityT } from "src/common/entities/core.entity";
import { Column, Entity } from "typeorm";

@Entity('follows_users')
export class FollowsSchema extends CoreEntityT {
    @Column({ nullable: true })
    followerId: number;//2

    @Column({ nullable: true })
    followeeId: number;//3
    //here user 2 is follows user 3
}