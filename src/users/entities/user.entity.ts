import { AuctionSchema } from 'src/auctions/entities/auction.entity';
import { BidSchema } from 'src/bid/entities/bid.entity';
import { CollectionSchema } from 'src/collection/entities/collection.entity';
import { CoreEntity, CoreEntityT } from 'src/common/entities/core.entity';
import { FutureVisiteSchema } from 'src/future-visite/entities/future-visite.entity';
import { IllustrationSchema } from 'src/illustration/entities/illustration.entity';
import { LikesSchema } from 'src/like/entities/like.entity';
import { NftSchema } from 'src/nft/entities/nft.entity';
import { NftHistorySchema } from 'src/nft/entities/nftHistory.entity';
import { OutlookSchema } from 'src/outlook/entities/outlook.entity';
import { PostsSchema, PostHideSchema } from 'src/posts/entities/post.entity';
import { ContentCollectionSchema } from 'src/content-collection/entities/content-collection.entity';
import { ReelsAudioSchema, ReelsSchema, WatchReelsSchema } from 'src/reels/entities/reel.entity';
import { StorySchema } from 'src/story/entities/story.entity';
import { ViewsSchema } from 'src/view/entities/view.entity';
import { FavoriteSchema } from 'src/favorite-user/entities/favorite.entity';
import { MessageSchema } from 'src/messages/entities/message.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ContentReportSchema } from 'src/content-report/entities/content-report.entity';
// import { PostCollectionsSchema } from 'src/post-collection/entities/collection.entity';

export class UserModle extends CoreEntity {
  status: boolean;
  email: string;
  password: string;
  username: string;
}

export class recentSearch {
  id: string;
  user_id: string;
  profile_photo: string;
  username: string;
  first_name: string;
  last_name: string;
}
export class following {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_photo: string;
}
export class follower {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_photo: string;
}

@Entity('users')
export class UserSchema extends CoreEntityT {
  @Column({
    default: true,
  })
  status: boolean;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  sendNfts: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  referrer_id: number;

  @Column({ nullable: true, default: false })
  referral_credited: boolean;

  @Column({ nullable: true })
  referral_token: string;

  @Column({ nullable: true, default: false })
  welcome_mail_sent: boolean;

  @Column({ nullable: true })
  age: number;

  @Column({ nullable: true, default: 0 })
  python_coin_balance: number;

  @Column({ nullable: true, default: false })
  invisible_mode: boolean;

  @Column({ nullable: true, default: false })
  is_terms_condition: boolean;

  @Column({ nullable: true })
  phone_verified_at: Date

  @Column({ nullable: true })
  email_verified_at: Date

  @Column({ nullable: true })
  phone: string

  @Column({ nullable: true })
  country_code: string

  @Column({ default: false })
  is_admin: boolean;

  @ManyToMany(() => BidSchema, (bid: BidSchema) => bid.users)
  bids: BidSchema[];

  @OneToMany(() => NftSchema, (nft) => nft.author, {
    nullable: true,
  })
  nfts: NftSchema[];
  @OneToMany(() => NftSchema, (nft) => nft.owner, {
    nullable: true,
  })
  nftOwner: NftSchema[];

  @OneToMany(() => NftHistorySchema, (nfthistory) => nfthistory.author, {
    nullable: true,
  })
  usernfthistorys: NftHistorySchema[];

  @OneToMany(() => AuctionSchema, (nft) => nft.author, {
    nullable: true,
  })
  auctions: AuctionSchema[];

  @OneToMany(() => CollectionSchema, (nft) => nft.author, {
    nullable: true,
  })
  collections: CollectionSchema[];

  @OneToMany(() => ReelsSchema, (nft) => nft.author, {
    nullable: true,
  })
  reels: ReelsSchema[];

  @OneToMany(() => WatchReelsSchema, (watchreel) => watchreel.author, {
    nullable: true,
  })
  reelswatch: WatchReelsSchema[];

  @OneToMany(() => ReelsAudioSchema, (reelaudio) => reelaudio.author, {
    nullable: true,
  })
  audio: ReelsAudioSchema[];

  @OneToMany(() => PostsSchema, (post) => post.author, {
    nullable: true,
  })
  posts: PostsSchema[];

  @OneToMany(() => FavoriteSchema, (favorite) => favorite.author, {
    nullable: true,
  })
  favorites: FavoriteSchema[];

  @OneToMany(() => ContentCollectionSchema, (collection) => collection.author, {
    nullable: true,
  })
  content_collection: ContentCollectionSchema[];

  @OneToMany(() => PostHideSchema, (hide) => hide.author, {
    nullable: true,
  })
  post_hide: PostHideSchema[];

  @OneToMany(() => LikesSchema, (like) => like.author, {
    nullable: true,
  })
  likes: LikesSchema[];

  @OneToMany(() => ViewsSchema, (view) => view.author, {
    nullable: true,
  })
  views: ViewsSchema[];

  @OneToMany(() => FutureVisiteSchema, (futurevisite) => futurevisite.author, {
    nullable: true,
  })
  futurevisites: FutureVisiteSchema[];

  @OneToMany(() => IllustrationSchema, (futurevisite) => futurevisite.author, {
    nullable: true,
  })
  illustrations: IllustrationSchema[];

  @OneToMany(() => StorySchema, (futurevisite) => futurevisite.author, {
    nullable: true,
  })
  stories: StorySchema[];

  @OneToMany(() => MessageSchema, (msgAuthor) => msgAuthor.sourceAuthor, {
    nullable: true,
  })
  msg_source_author: MessageSchema[];

  @Column({ nullable: true })
  is_creator: string;

  @Column({ nullable: true })
  walletAddress: string;

  @Column({ nullable: true })
  professional_summery: string;

  @Column({ nullable: true })
  latitude: string;

  @Column({ nullable: true })
  longitude: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: true })
  profile_photo: string;

  @Column({ nullable: true })
  cover_photo: string;

  @Column({ nullable: true, default: 0 })
  total_value_of_sell: number;

  @Column({ nullable: true, default: 0 })
  total_following: number;

  @Column({ nullable: true, default: 0 })
  total_followers: number;

  @Column('simple-array', { nullable: true })
  preference: string[];

  @Column({ nullable: true, default: false })
  professional_account: boolean

  @Column({ nullable: true, default: true })
  mention_check: boolean

  @Column({ nullable: true })
  business_name: string

  @Column({ nullable: true })
  business_category: string

  @Column({ nullable: true })
  business_website: string

  @OneToMany(() => OutlookSchema, (outlook) => outlook.user, {
    nullable: true,
  })
  useroutlook: OutlookSchema[];

  @Column({ nullable: true })
  fcm_token: string;

  @Column({ nullable: true })
  device_token: string;

  @Column({ nullable: true })
  firebaseUID: string;

  @OneToMany(() => ContentReportSchema, (contentreport) => contentreport.author, {
    nullable: true,
  })
  content_report: ContentReportSchema[];

  @Column({ nullable: true })
  language: string;

  @Column('simple-array', { nullable: true })
  reels_category: string[];

  @Column({ nullable: true, default: 0 })
  otp: number;
}
@Entity('registerUsers')
export class RegisterUserSchema extends CoreEntityT {
  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  professional_summery: string;

  @Column({ nullable: true })
  full_name: string;

  @Column({ nullable: true, default: 0 })
  otp: number;

  @Column({ nullable: true })
  firebaseUID: string;
}
