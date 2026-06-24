import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { PortalService } from "./portal.service";
import { CreatePortalJobDto } from "./dto/create-portal-job.dto";
import { UpdatePortalJobDto } from "./dto/update-portal-job.dto";
import { PortalMessageDto } from "./dto/portal-message.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import {
  CurrentUser,
  AuthUser,
} from "../../common/decorators/current-user.decorator";

/** פורטל המעסיקים — נגיש רק ל-role=employer; הכל מתוחם ל-employer של המשתמש. */
@Controller("portal")
@UseGuards(RolesGuard)
@Roles("employer")
export class PortalController {
  constructor(private readonly portal: PortalService) {}

  @Get("me")
  me(@CurrentUser() user: AuthUser) {
    return this.portal.getMe(user.employerId);
  }

  @Get("jobs")
  listJobs(@CurrentUser() user: AuthUser) {
    return this.portal.listJobs(user.employerId);
  }

  @Post("jobs")
  createJob(@CurrentUser() user: AuthUser, @Body() dto: CreatePortalJobDto) {
    return this.portal.createJob(user.employerId, dto);
  }

  @Get("jobs/:id")
  getJob(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.portal.getJob(user.employerId, id);
  }

  @Patch("jobs/:id")
  updateJob(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: UpdatePortalJobDto,
  ) {
    return this.portal.updateJob(user.employerId, id, dto);
  }

  @Get("placements")
  listPlacements(@CurrentUser() user: AuthUser) {
    return this.portal.listPlacements(user.employerId);
  }

  @Post("messages")
  sendMessage(@CurrentUser() user: AuthUser, @Body() dto: PortalMessageDto) {
    return this.portal.sendMessage(user.employerId, dto.message);
  }
}
