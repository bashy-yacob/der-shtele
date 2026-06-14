import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { QueryJobsDto } from './dto/query-jobs.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // ---- ציבורי ----

  @Public()
  @Get()
  findPublic(@Query() query: QueryJobsDto) {
    return this.jobsService.findPublic(query);
  }

  @Public()
  @Get(':id')
  findPublicOne(@Param('id') id: string) {
    return this.jobsService.findPublicOne(id);
  }

  // ---- פנימי (צוות) ----

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('staff', 'admin')
  findAll() {
    return this.jobsService.findAll();
  }

  @Get('admin/:id')
  @UseGuards(RolesGuard)
  @Roles('staff', 'admin')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('staff', 'admin')
  create(@Body() dto: CreateJobDto) {
    return this.jobsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('staff', 'admin')
  update(@Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.jobsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }
}
