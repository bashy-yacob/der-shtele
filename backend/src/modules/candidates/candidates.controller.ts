import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CandidatesService } from "./candidates.service";
import { CreateCandidateDto } from "./dto/create-candidate.dto";
import { UpdateCandidateDto } from "./dto/update-candidate.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { StorageService } from "../../common/storage/storage.service";
import { resumeUploadOptions } from "../../common/storage/resume-upload.options";

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

  /** הגשת מועמדות מהאתר. דורש התחברות (מועמד רשום). */
  @Post()
  apply(@Body() dto: CreateCandidateDto) {
    return this.candidatesService.createFromApplication(dto);
  }

  // ---- CRM (צוות) ----

  @Get()
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  findAll() {
    return this.candidatesService.findAll();
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

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  update(@Param("id") id: string, @Body() dto: UpdateCandidateDto) {
    return this.candidatesService.update(id, dto);
  }
}
