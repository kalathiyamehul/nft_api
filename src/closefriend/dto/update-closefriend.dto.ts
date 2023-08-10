import { PartialType } from '@nestjs/swagger';
import { CreateClosefriendDto } from './create-closefriend.dto';

export class UpdateClosefriendDto extends PartialType(CreateClosefriendDto) {}
