import { Column, Entity, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { CoreEntity, CoreEntityT } from '../../common/entities/core.entity';
import { UserSchema } from '../../users/entities/user.entity';

@Entity('messages')
export class MessageSchema extends CoreEntityT {
  @Column({ nullable: true })
  message: string;

  @Column({ nullable: true, default: 'text' })
  type: string;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column({ nullable: true, type: 'json' })
  file_url: any;

  @Column({ nullable: true, default: false })
  is_read: boolean;

  @Column('timestamp with time zone', { nullable: true })
  read_time: Date;

  @Column({ nullable: true, default: '' })
  source: string;

  @Column({ nullable: true, default: 0 })
  source_id: number;

  @ManyToOne(() => UserSchema, (msg: UserSchema) => msg.msg_source_author, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  sourceAuthor: UserSchema;

  @Column({ nullable: true, default: '' })
  conversation_id: string;
}

@Entity('read_messages')
export class ReadMessageSchema extends CoreEntityT {
  @Column()
  owner_id: number;

  @Column()
  sender_id: number;

  @Column()
  last_send_msg: number;

  @Column()
  last_read_msg: number;

  @Column({ nullable: true, default: '' })
  conversation_id: string;
}