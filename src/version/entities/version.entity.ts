import { CoreEntity, CoreEntityT } from 'src/common/entities/core.entity';
import {
  Column,
  Entity
} from 'typeorm';

export class VersionModle extends CoreEntity {
  is_force_update: boolean;
  os: string;
  version: number;
}

@Entity('app_settings')
export class VersionSchema extends CoreEntityT {
  
  @Column({ nullable: true })
  os: string;
  
  @Column({ nullable: true })
  version: number;

  @Column({ default: false })
  is_force_update: boolean;
}
