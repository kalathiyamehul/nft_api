import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TypeRole } from 'src/like/dto/create-like.dto';
import { CommentService } from './comment.service';
import { CreateCommentDto, updateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('Comment & Like')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Put('addComment')
  @ApiQuery({ name: 'type', enum: TypeRole })
  create(@Body() createCommentDto: CreateCommentDto,
    @Query('type') type: TypeRole = TypeRole.REELS,
    @Req() req) {
    const user_id = req?.user?.payload?.id;
    return this.commentService.create(createCommentDto, type,user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Put('updateComment/:commet_id')
  updateComment(@Param('commet_id') commet_id: number,
    @Body() createCommentDto: updateCommentDto,
    @Req() req) {
    const user_id = req?.user?.payload?.id;
    return this.commentService.updateComment(createCommentDto, commet_id,user_id);
  }

  @Delete('deleteComment/:commet_id')
  deleteComment(@Param('commet_id') commet_id: number) {
    return this.commentService.deleteComment(commet_id);
  }

  @Get('getComment/:id')
  @ApiQuery({ name: 'type', enum: TypeRole })
  getReelsComment(@Param('id') id: number,
    @Query('type') type: TypeRole = TypeRole.REELS,
  ) {
    return this.commentService.getComment(type, id);
  }

}
