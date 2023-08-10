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
import { OutlookService } from './outlook.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OutlookDto } from './dto/outlook.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Outlook')
@Controller("outlook")
export class OutlookController {
  constructor(private readonly outlookService: OutlookService) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('add_outlook_details')
  addOutlookData(@Body() outlookDto: OutlookDto, @Req() req) {
    const id = req?.user?.payload?.id;
    return this.outlookService.create(outlookDto, id);
  }
}
