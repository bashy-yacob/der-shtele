import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EmployersService } from './employers.service';
import { CreateEmployerDto } from './dto/create-employer.dto';
import { UpdateEmployerDto } from './dto/update-employer.dto';
import { CreatePortalUserDto } from './dto/create-portal-user.dto';
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
