import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CandidatesService } from "./candidates.service";
import { CreateCandidateDto } from "./dto/create-candidate.dto";
import { UpdateCandidateDto } from "./dto/update-candidate.dto";
import { CreateCallLogDto } from "./dto/create-call-log.dto";
import { HireCandidateDto } from "./dto/hire-candidate.dto";
import { QueryCandidatesDto } from "./dto/query-candidates.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { StorageService } from "../../common/storage/storage.service";
import { resumeUploadOptions } from "../../common/storage/resume-upload.options";
import {
  CurrentUser,
  AuthUser,
} from "../../common/decorators/current-user.decorator";

@Controller("candidates")
export class CandidatesController {
  constructor(
    private readonly candidatesService: CandidatesService,
    private readonly storage: StorageService,
  ) {}

  // ---- הגשת מועמדות (מחייב התחברות — אין הגשה אנונימית, לפי האיפיון) ----

  /** העלאת קו"ח (multipart) — מחזיר נתיב לשליחה ב-create. דורש התחברות. */
  @Post("resume")
  @UseInterceptors(FileInterceptor("resume", resumeUploadOptions))
  async uploadResume(@UploadedFile() file: Express.Multer.File) {
    const path = await this.storage.uploadResume(file);
    return { path };
  }

  /** הגשת מועמדות מהאתר. דורש התחברות (מועמד רשום) — ההגשה נקשרת למשתמש. */
  @Post()
  apply(@CurrentUser() user: AuthUser, @Body() dto: CreateCandidateDto) {
    return this.candidatesService.createFromApplication(dto, user.userId);
  }

  /** ההגשות של המשתמש המחובר (לאזור האישי). חייב לבוא לפני ":id". */
  @Get("me/applications")
  myApplications(@CurrentUser() user: AuthUser) {
    return this.candidatesService.getMyApplications(user.userId);
  }

  /** מצב הקו"ח של המשתמש המחובר — קיים? + קישור הורדה (אזור אישי). */
  @Get("me/cv")
  myCv(@CurrentUser() user: AuthUser) {
    return this.candidatesService.getMyCv(user.userId);
  }

  /** החלפת הקו"ח מהפרופיל (multipart). דורש פרופיל מועמד קיים. */
  @Post("me/cv")
  @UseInterceptors(FileInterceptor("resume", resumeUploadOptions))
  async replaceMyCv(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const path = await this.storage.uploadResume(file);
    return this.candidatesService.setMyCv(user.userId, path);
  }

  // ---- CRM (צוות) ----

  @Get()
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  findAll() {
    return this.candidatesService.findAll();
  }

  /** רשימת ה-CRM עם עימוד/סינון בצד שרת. חייב לבוא לפני ":id". */
  @Get("paged")
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  findAllPaged(@Query() query: QueryCandidatesDto) {
    return this.candidatesService.findAllPaged(query);
  }

  @Get(":id")
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  findOne(@Param("id") id: string) {
    return this.candidatesService.findOne(id);
  }

  @Get(":id/resume")
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  resume(@Param("id") id: string) {
    return this.candidatesService.getResumeUrl(id);
  }

  /** הוספת רשומת שיחה ידנית לכרטיס מועמד. */
  @Post(":id/calls")
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  addCall(@Param("id") id: string, @Body() dto: CreateCallLogDto) {
    return this.candidatesService.addCallLog(id, dto);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  update(@Param("id") id: string, @Body() dto: UpdateCandidateDto) {
    return this.candidatesService.update(id, dto);
  }

  /** סימון מועמד כגויס — יוצר גיוס + עמלה ומתחיל את לוג הפעולות. */
  @Post(":id/hire")
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  hire(
    @Param("id") id: string,
    @Body() dto: HireCandidateDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.candidatesService.markHired(id, dto, user.fullName);
  }
}
