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
import { VersionService } from './version.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateVersionDto, UpdateVersionDto } from './dto/create-version.dto';
import { AuthGuard } from '@nestjs/passport';
import { CheckVersionDto } from './dto/check-version.dto';

@ApiTags('Version')
@Controller("Version")
export class VersionController {
  constructor(private readonly versionService: VersionService) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('add_version')
  addAppVersion(@Body() createVersionDto: CreateVersionDto, @Req() req) {
    const id = req?.user?.payload?.id;
    return this.versionService.create(createVersionDto, id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('update_version')
  updateAppVersion(@Body() updateVersionDto: UpdateVersionDto, @Req() req) {
    const id = req?.user?.payload?.id;
    return this.versionService.update(updateVersionDto, id);
  }

  @Post('check_version')
  checkAppVersion(@Body() checkVersionRepository: CheckVersionDto) {
    return this.versionService.check(checkVersionRepository);
  }
}
