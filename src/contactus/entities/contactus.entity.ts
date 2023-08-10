import { CoreEntity, CoreEntityT } from 'src/common/entities/core.entity';
import { Column, Entity } from 'typeorm';

export class ContactusModel extends CoreEntity {
  email: string;
  name: string;
  subject: string;
  description: string;
}

@Entity('contactus')
export class ContactusSchema extends CoreEntityT {
  @Column()
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ nullable: true })
  description: string;
}
