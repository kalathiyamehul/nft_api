import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BidModule } from './bid/bid.module';
import { NftModule } from './nft/nft.module';
import { CategoriesModule } from './categories/categories.module';
import { FavoriteModule } from './favorite/favorite.module';
import { UploadsModule } from './uploads/uploads.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CollectionModule } from './collection/collection.module';
import { AuctionsModule } from './auctions/auctions.module';
import { FollowsModule } from './follows/follows.module';
import path from 'path';
import { InstagramModule } from './instagram/instagram.module';
import { ContactusModule } from './contactus/contactus.module';
import { SubscriberModule } from './subscribe/subscribe.module';
import { ReelsModule } from './reels/reels.module';
import { LikeModule } from './like/like.module';
import { HashtagModule } from './hashtag/hashtag.module';
import { FutureVisiteModule } from './future-visite/future-visite.module';
import { StoryModule } from './story/story.module';
import { IllustrationModule } from './illustration/illustration.module';
import { MessagesModule } from './messages/messages.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SettingsModule } from './settings/settings.module';
import { LocarnoModule } from './locarno/locarno.module';
import { ClosefriendModule } from './closefriend/closefriend.module';
import { CommentModule } from './comment/comment.module';
import { MoralisModule } from './moralis/moralis.module';
import { AppVersionModule } from './version/version.module';
import { OutlookModule } from './outlook/outlook.module';
import { ViewModule } from './view/view.module';
import { PostsModule } from './posts/posts.module';
import { FavoriteUserModule } from './favorite-user/favorite.module';
import { ContentCollectionModule } from './content-collection/content-collection.module';
import { ContentReportModule } from './content-report/content-report.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    UploadsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [path.join(__dirname, '**', '*.entity.{ts,js}')],
      synchronize: process.env.SYNCHRONIZE ? true : false,
      autoLoadEntities: process.env.SYNCHRONIZE ? true : false,
    }),
    BidModule,
    NftModule,
    CategoriesModule,
    FavoriteModule,
    CollectionModule,
    AuctionsModule,
    FollowsModule,
    InstagramModule,
    ContactusModule,
    SubscriberModule,
    ReelsModule,
    LikeModule,
    HashtagModule,
    FutureVisiteModule,
    StoryModule,
    IllustrationModule,
    MessagesModule,
    SettingsModule,
    LocarnoModule,
    ClosefriendModule,
    CommentModule,
    MoralisModule,
    AppVersionModule,
    OutlookModule,
    ViewModule,
    PostsModule,
    FavoriteUserModule,
    ContentCollectionModule,
    ContentReportModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
