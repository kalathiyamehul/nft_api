import { CoreEntityT } from 'src/common/entities/core.entity';
import { Column, Entity, OneToOne } from 'typeorm';
import { UserSchema } from '../../users/entities/user.entity';

// export class CategoryModel {
//     nft: NftModel;
// }

@Entity('users_closefriend')
export class CloseFriendSchema extends CoreEntityT {
    @Column()
    closefriendID: number;

    @Column()
    userID: number;
}
