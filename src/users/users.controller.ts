import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AddSearchItemDto } from './dto/add-search-item.dto';

@ApiTags('User')
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('getUserById/:id')
  getUser(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Get('getAllUser')
  getAllUsers() {
    return this.usersService.getUsers();
  }

  @Get('getUser/:page')
  getUsers(@Param('page') page: string) {
    return this.usersService.getUserList(+page);
  }

  @Get('setDemoData')
  setDemoData() {
    return this.usersService.setDemoData();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('search/:param')
  getSearchItem(@Param('param') param: string, @Req() req) {
    const id = req?.user?.payload?.id;
    return this.usersService.getSearchItem(param, +id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('search_user/:param')
  getSearchByUsername(@Param('param') param: string, @Req() req) {
    const id = req?.user?.payload?.id;
    return this.usersService.getSearchItem(param, +id);
  }


  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('recent-search')
  getRecentSearches(@Req() req) {
    const id = req?.user?.payload?.id;
    return this.usersService.getRecentSearches(+id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('add-search')
  addSearchItem(@Body() addSearchItemDto: AddSearchItemDto, @Req() req) {
    const id = req?.user?.payload?.id;
    return this.usersService.addSearchItem(addSearchItemDto, +id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('clear-all-search')
  removeAllSearch(@Req() req) {
    const id = req?.user?.payload?.id;
    return this.usersService.removeAllSearch(+id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('clear-search/:id')
  removeSearch(@Param('id') search_id: number, @Req() req) {
    return this.usersService.removeSearch(+search_id);
  }

  @UseGuards(AuthGuard())
  @Put('updateuser')
  updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req) {
    const id = req?.user?.payload?.id;
    return this.usersService.update(id, updateUserDto);
  }

  @Delete('deleteUser/:id')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Post('activeUser/:id')
  activeUser(@Param('id') id: number) {
    return this.usersService.activeUser(id);
  }
  @Post('deactiveUser/:id')
  deactiveUser(@Param('id') id: number) {
    return this.usersService.deactiveUser(id);
  }

  @Get('getauthor/:author_name')
  getauthor(@Param('author_name') author_name: string) {
    return this.usersService.getauthor(author_name);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('logout')
  logoutUser(@Req() req) {
    const id = req?.user?.payload?.id;
    return this.usersService.logoutUser(+id);
  }
}
