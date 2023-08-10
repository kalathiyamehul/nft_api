import { CoreEntityT } from 'src/common/entities/core.entity';
import {
  Column,
  Entity,
} from 'typeorm';

@Entity('users_recentsearch')
export class RecentSearchSchema extends CoreEntityT {
  @Column({
    nullable: true,
  })
  last_name: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  profile_photo: string;

  @Column({ nullable: true })
  user_id: number;
  
  @Column({ nullable: true })
  autherId: number;

  @Column({ nullable: true })
  shortid: string;

}
