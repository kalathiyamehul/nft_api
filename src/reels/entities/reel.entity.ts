import { CoreEntityT } from 'src/common/entities/core.entity';
import { HashTagSchema } from 'src/hashtag/entities/hashtag.entity';
import { LikesSchema } from 'src/like/entities/like.entity';
import { UserSchema } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, ViewColumn, ViewEntity } from 'typeorm';

@Entity('reels')
export class ReelsSchema extends CoreEntityT {
    @Column()
    title: string;

    @Column()
    video_url: string;

    @Column({ nullable: true })
    video_type: string;

    @Column({ nullable: true })
    duration: number;

    @Column({ nullable: true })
    thumbnail_url: string;

    @Column({ nullable: true })
    audio_id: number;

    @Column({ nullable: true })
    audio_name: string;

    @Column({ nullable: true })
    audio_url: string;

    @Column({ nullable: true })
    audio_thumbnail: string;

    @Column({ nullable: true })
    audio_duration: string;

    @Column()
    description: string;

    @Column({ nullable: true, default: 0 })
    total_like: number

    @Column({ nullable: true, default: 0 })
    total_view: number

    @Column({ nullable: true, default: 0 })
    total_comment: number

    @Column({ nullable: true, default: 0 })
    total_double_like: number

    @OneToMany(() => HashTagSchema, (hashtag) => hashtag.reel, {
        eager: true,
        nullable: true,
    })
    hashtag: HashTagSchema[];

    @ManyToOne(() => UserSchema, (user: UserSchema) => user.reels, {
        nullable: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn()
    author?: UserSchema;

    @OneToMany(() => WatchReelsSchema, (watchreel) => watchreel.reel, {
        eager: true,
        nullable: true,
    })
    watch: WatchReelsSchema[];

    @OneToMany(() => ReelsAudioSchema, (reelaudio) => reelaudio.reel, {
        eager: true,
        nullable: true,
    })
    audio: ReelsAudioSchema[];

    @Column('simple-array', { nullable: true })
    hashtags: string[];

    @Column({ nullable: true, default: 'HINDI' })
    language: string

    @Column({ nullable: true })
    category: string
}

@Entity('reels_watch')
export class WatchReelsSchema extends CoreEntityT {
    @ManyToOne(() => ReelsSchema, (reels: ReelsSchema) => reels.watch, {
        nullable: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn()
    reel?: ReelsSchema;

    @ManyToOne(() => UserSchema, (user: UserSchema) => user.reelswatch, {
        nullable: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn()
    author?: UserSchema;

    @Column({ nullable: true, default: 0 })
    watch_duration: number

    @Column({ nullable: true })
    reel_duration: number

    @Column({ default: 0, type: "float" })
    watch_per: number

    @Column({ default: 0 })
    watch_cnt: number
}

@Entity('reels_audio')
export class ReelsAudioSchema extends CoreEntityT {
    @ManyToOne(() => ReelsSchema, (reels: ReelsSchema) => reels.audio, {
        nullable: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn()
    reel?: ReelsSchema;

    @ManyToOne(() => UserSchema, (user: UserSchema) => user.audio, {
        nullable: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn()
    author?: UserSchema;

    @Column({ nullable: true })
    audio_name: string;

    @Column({ nullable: true })
    audio_url: string;

    @Column({ nullable: true })
    audio_duration: string;

    @Column({ nullable: true })
    audio_thumbnail: string;
}

@ViewEntity({
    name: 'reels_order',
    expression: `
    SELECT row_number() OVER (ORDER BY (ROW(count(1), sum(watch.watch_per) / count(1)))) AS sr_no,
        sum(watch.watch_per) / count(1) AS watch_per,
        count(1) AS reels_cnt,
        reels.category,
        watch."authorId",
        sum(watch.watch_cnt) / count(1) AS watch_cnt
    FROM reels_watch watch
        JOIN reels ON reels.id = watch."reelId"
    GROUP BY watch."authorId", reels.category
    ORDER BY (count(1)) DESC, (sum(watch.watch_per) / count(1))
    `,
})
export class reels_order {
    @ViewColumn()
    sr_no: number

    @ViewColumn()
    watch_per: number

    @ViewColumn()
    reels_cnt: number

    @ViewColumn()
    category: string

    @ViewColumn()
    authorId: number

    @ViewColumn()
    watch_cnt: number
}

@ViewEntity({
    name: 'reels_like',
    expression: `
    SELECT count(1) AS cnt,
        likes."authorId",
        unnest(string_to_array(reels.hashtags, ',')) AS hashtag
    FROM likes
        LEFT JOIN reels ON reels.id = likes.type_id
    WHERE likes.type = 'reels'
    GROUP BY likes."authorId", (unnest(string_to_array(reels.hashtags, ',')))
    ORDER BY likes."authorId", (count(1)) DESC
    `,
})
export class reels_like {
    @ViewColumn()
    cnt: number

    @ViewColumn()
    authorId: number

    @ViewColumn()
    hashtag: string
}
