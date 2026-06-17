import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { SavedJobsService } from "./saved-jobs.service";
import { SaveJobDto } from "./dto/save-job.dto";
import {
  CurrentUser,
  AuthUser,
} from "../../common/decorators/current-user.decorator";

/**
 * משרות שמורות של המשתמש המחובר. מוגן ב-JwtAuthGuard הגלובלי —
 * המשתמש נלקח מה-token, אז כל אחד רואה/משנה רק את השמורות של עצמו.
 */
@Controller("saved-jobs")
export class SavedJobsController {
  constructor(private readonly savedJobs: SavedJobsService) {}

  /** רשימת המשרות השמורות (עם פרטי המשרה). */
  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.savedJobs.listForUser(user.userId);
  }

  /** רק מזהי המשרות השמורות — לסימון מצב הלב ברשימות. */
  @Get("ids")
  ids(@CurrentUser() user: AuthUser) {
    return this.savedJobs.listJobIds(user.userId);
  }

  /** שמירת משרה. */
  @Post()
  save(@CurrentUser() user: AuthUser, @Body() dto: SaveJobDto) {
    return this.savedJobs.save(user.userId, dto.jobId);
  }

  /** הסרת משרה מהשמורות. */
  @Delete(":jobId")
  unsave(@CurrentUser() user: AuthUser, @Param("jobId") jobId: string) {
    return this.savedJobs.unsave(user.userId, jobId);
  }
}
