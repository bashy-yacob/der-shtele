import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { PlacementsService } from "./placements.service";
import { CreatePlacementDto } from "./dto/create-placement.dto";
import { UpdatePlacementDto } from "./dto/update-placement.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import {
  CurrentUser,
  AuthUser,
} from "../../common/decorators/current-user.decorator";

@Controller("placements")
@UseGuards(RolesGuard)
@Roles("staff", "admin")
export class PlacementsController {
  constructor(private readonly placementsService: PlacementsService) {}

  @Get()
  findAll() {
    return this.placementsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.placementsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePlacementDto, @CurrentUser() user: AuthUser) {
    return this.placementsService.create(dto, user.fullName);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdatePlacementDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.placementsService.update(id, dto, user.fullName);
  }
}
