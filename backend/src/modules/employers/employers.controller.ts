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
import { EmployersService } from './employers.service';
import { CreateEmployerDto } from './dto/create-employer.dto';
import { UpdateEmployerDto } from './dto/update-employer.dto';
import { CreatePortalUserDto } from './dto/create-portal-user.dto';
import { RejectEmployerDto } from './dto/reject-employer.dto';
import { QueryEmployersDto } from './dto/query-employers.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

// כל המודול מוגן — מעסיקים נראים רק לצוות
@Controller('employers')
@UseGuards(RolesGuard)
@Roles('staff', 'admin')
export class EmployersController {
  constructor(private readonly employersService: EmployersService) {}

  @Get()
  findAll() {
    return this.employersService.findAll();
  }

  /** רשימת הניהול עם עימוד/סינון בצד שרת. חייב לבוא לפני ":id". */
  @Get('paged')
  findAllPaged(@Query() query: QueryEmployersDto) {
    return this.employersService.findAllPaged(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateEmployerDto) {
    return this.employersService.create(dto);
  }

  /** הפקת פרטי כניסה לפורטל המעסיק (סעיף 6). */
  @Post(':id/portal-user')
  createPortalUser(
    @Param('id') id: string,
    @Body() dto: CreatePortalUserDto,
  ) {
    return this.employersService.createPortalUser(id, dto);
  }

  /** אישור בקשת גישה של מעסיק (סעיף 6) — pending → approved. */
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.employersService.approve(id);
  }

  /** דחיית בקשת גישה של מעסיק — pending → rejected. */
  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() dto: RejectEmployerDto) {
    return this.employersService.reject(id, dto.reason);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmployerDto) {
    return this.employersService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.employersService.remove(id);
  }
}
