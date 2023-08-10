import { Type } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export class CoreEntity {
  id: number;
  @Type(() => Date)
  created_at: Date;
  @Type(() => Date)
  updated_at: Date;
}
function formatDate(date: Date) {
  var d = date,
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('-');
}
@Entity('CoreEntity')
export class CoreEntityT {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('timestamp with time zone', {
    nullable: true,
    default: () => `now()`
  })
  created_at: Date;

  @Column('timestamp with time zone', {
    nullable: true,
    default: () => `now()`
  })
  updated_at: Date;
}

