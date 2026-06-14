import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PlacementsService } from './placements.service';
import { CreatePlacementDto } from './dto/create-placement.dto';
import { UpdatePlacementDto } from './dto/update-placement.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('placements')
@UseGuards(RolesGuard)
@Roles('staff', 'admin')
export class PlacementsController {
  constructor(private readonly placementsService: PlacementsService) {}

  @Get()
  findAll() {
    return this.placementsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.placementsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePlacementDto) {
    return this.placementsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlacementDto) {
    return this.placementsService.update(id, dto);
  }
}
