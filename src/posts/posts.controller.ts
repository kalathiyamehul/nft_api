import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('/create_post')
  create(@Body() createPostDto: CreatePostDto, @Req() req) {
    const id = req?.user?.payload?.id
    return this.postsService.create(createPostDto, id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/getPostsByAuthorID/:user_id/:page')
  getPostsByAuthorID(@Param('page') page: number, @Param('user_id') user_id: number) {
    return this.postsService.getPostsByAuthorID(page, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/getTrandingPosts/:page')
  getTrandingPosts(@Param('page') page: number, @Req() req) {
    const user_id = req?.user?.payload?.id
    return this.postsService.getTrandingPosts(page, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/:id')
  getTrandingPostsById(@Param('id') id: string, @Req() req) {
    const user_id = req?.user?.payload?.id
    return this.postsService.getPostsById(id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Put('/updatemetadata/:id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @Req() req) {
    const user_id = req?.user?.payload?.id
    return this.postsService.update(+id, updatePostDto, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Delete('/deleteposts/:id')
  remove(@Param('id') id: string, @Req() req) {
    const user_id = req?.user?.payload?.id
    return this.postsService.remove(+id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Put('/hide/:post_id')
  hidepost(@Param('post_id') post_id: number, @Req() req) {
    const user_id = req?.user?.payload?.id
    return this.postsService.hidePost('posts', post_id, user_id);
  }

  @Get('add_thumbnail/:offset')
  async add_thumbnail(@Param('offset') offset: string) {
    await this.postsService.add_thumbnail(+offset);
    return true;
  }
}
