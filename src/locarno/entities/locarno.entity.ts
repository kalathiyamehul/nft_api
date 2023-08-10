import { CoreEntityT } from "src/common/entities/core.entity";
import { Column, Entity } from "typeorm";

@Entity('location_data')
export class LocationDataSchema extends CoreEntityT {
    @Column({ nullable: true })
    name: string
    @Column({ nullable: true })
    category: string
    @Column({ nullable: true })
    latitude: string
    @Column({ nullable: true })
    longitude: string
    @Column({ nullable: true })
    address1: string
    @Column({ nullable: true })
    address2: string
    @Column({ nullable: true })
    city: string
    @Column({ nullable: true })
    country: string
    @Column({ nullable: true })
    postcode: number
    @Column({ nullable: true })
    mobile_no: string
    @Column({ nullable: true })
    website: string
    @Column('simple-array', { nullable: true })
    images: string[];
}