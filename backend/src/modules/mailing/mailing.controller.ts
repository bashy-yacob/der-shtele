import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { CandidateStatus, JobField } from "@prisma/client";
import { MailingService } from "./mailing.service";
import { SendMailingDto } from "./dto/send-mailing.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

/** ניהול רשימת התפוצה — צוות פנימי בלבד (סעיף 8.3). */
@Controller("mailing")
@UseGuards(RolesGuard)
@Roles("staff", "admin")
export class MailingController {
  constructor(private readonly mailingService: MailingService) {}

  /** רשימת מנויים פעילים, עם סינון אופציונלי לפי תחום/אזור/סטטוס. */
  @Get("subscribers")
  subscribers(
    @Query("field") field?: JobField,
    @Query("region") region?: string,
    @Query("status") status?: CandidateStatus,
  ) {
    return this.mailingService.subscribers({ field, region, status });
  }

  /** שליחה ידנית — חסומה בשבת/חג. */
  @Post("send")
  send(@Body() dto: SendMailingDto) {
    return this.mailingService.send(dto);
  }
}
