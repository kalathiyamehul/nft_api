import { CoreEntityT } from "src/common/entities/core.entity";
import { Column, Entity } from "typeorm";
import { Links } from "../dto/create-setting.dto";

@Entity('user_report_problem')
export class ReportProblemSchema extends CoreEntityT {
    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    status: string;

    @Column({ nullable: true })
    subject: string;

    @Column({ nullable: true })
    user_id: number

    @Column('simple-array', { nullable: true })
    attachments: string[];
}

@Entity('user_request_validation')
export class RequestValidationSchema extends CoreEntityT {
    @Column({ nullable: true })
    full_name: string;

    @Column({ nullable: true })
    document_url: string;

    @Column({ nullable: true })
    country: string;

    @Column({ nullable: true })
    also_known_as: string;

    @Column({ nullable: true })
    user_id: number

    @Column({ nullable: true })
    category: string

    @Column({ nullable: true })
    document_type: string

    @Column('simple-array', { nullable: true })
    links: Links[];
}

@Entity('user_content_report')
export class ReportContentSchema extends CoreEntityT {
    @Column({ nullable: true })
    report_text: string;

    @Column({ nullable: true })
    type: string;

    @Column({ nullable: true })
    type_id: number;

    @Column({ nullable: true })
    user_id: number;

}