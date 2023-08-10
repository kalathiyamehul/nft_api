import { CoreEntity, CoreEntityT } from 'src/common/entities/core.entity';
import { UserSchema } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne
} from 'typeorm';

@Entity('notification')
export class FCMSchema extends CoreEntityT {
  
  @Column({ nullable: true })
  device_token: string;
  
  @Column({ nullable: true })
  title: string;
  
  @Column({ nullable: true })
  msg: string;
  
  @Column('jsonb',{ nullable: true })
  data: [];
  
  @Column({ nullable: true })
  sender_id: number;
  
  @Column({ nullable: true })
  notification_type: string;

  @ManyToOne(() => UserSchema, (notification: UserSchema) => notification.usernfthistorys, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  user: UserSchema;
}
