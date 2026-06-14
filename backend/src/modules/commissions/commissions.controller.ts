import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { UpdateCommissionDto } from './dto/update-commission.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('commissions')
@UseGuards(RolesGuard)
@Roles('admin')
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Get()
  findAll() {
    return this.commissionsService.findAll();
  }

  @Get('due')
  findDue() {
    return this.commissionsService.findDue();
  }

  @Get('summary')
  summary() {
    return this.commissionsService.summary();
  }

  @Patch(':placementId')
  updateStatus(
    @Param('placementId') placementId: string,
    @Body() dto: UpdateCommissionDto,
  ) {
    return this.commissionsService.updateStatus(placementId, dto);
  }
}
