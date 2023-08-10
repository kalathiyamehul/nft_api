import { CoreEntity, CoreEntityT } from 'src/common/entities/core.entity';
import { UserSchema } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne
} from 'typeorm';

export class OutlookModle extends CoreEntity {
  gender: string;
  education: string;
  work: string;
  height: number;
  weight: number;
  age: number;
  drinking: boolean;
  smoking: boolean;
  relagion: string;
  language: string;
  intrest: string;
  politics: string;
  relationshipStatus: string;
  isSelfData: boolean;
}

@Entity('user_outlook')
export class OutlookSchema extends CoreEntityT {

  @Column({ nullable: true })
  gender: string;
  
  @Column({ nullable: true })
  education: string;
  
  @Column({ nullable: true })
  work: string;
  
  @Column({ nullable: true })
  height: number;
  
  @Column({ nullable: true })
  weight: number;
  
  @Column({ nullable: true })
  age: number;
  
  @Column({ default: false })
  drinking: boolean;
  
  @Column({ default: false })
  smoking: boolean;
  
  @Column({ nullable: true })
  relagion: string;
  
  @Column({ nullable: true })
  language: string;
  
  @Column({ nullable: true })
  intrest: string;
  
  @Column({ nullable: true })
  politics: string;
  
  @Column({ nullable: true })
  relationshipStatus: string;

  @Column({ default: true })
  isSelfData: boolean;

  @ManyToOne(() => UserSchema, (outlook: UserSchema) => outlook.useroutlook, {
      cascade: true,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
  })
  @JoinColumn()
  user: UserSchema;
}
