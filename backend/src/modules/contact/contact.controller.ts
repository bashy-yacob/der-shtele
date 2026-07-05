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
import { ContactService } from "./contact.service";
import { CreateContactDto } from "./dto/create-contact.dto";
import { UpdateContactHandledDto } from "./dto/update-contact-handled.dto";
import { QueryContactsDto } from "./dto/query-contacts.dto";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { StorageService } from "../../common/storage/storage.service";
import { resumeUploadOptions } from "../../common/storage/resume-upload.options";

@Controller("contact")
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly storage: StorageService,
  ) {}

  /** טופס צור קשר — multipart עם קו"ח אופציונלי. */
  @Public()
  @Post()
  @UseInterceptors(FileInterceptor("resume", resumeUploadOptions))
  async create(
    @Body() dto: CreateContactDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const resumePath =
      file && file.size > 0 ? await this.storage.uploadResume(file) : null;
    return this.contactService.create(dto, resumePath);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  findAll() {
    return this.contactService.findAll();
  }

  /** רשימת הפניות עם עימוד/סינון בצד שרת. */
  @Get("paged")
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  findAllPaged(@Query() query: QueryContactsDto) {
    return this.contactService.findAllPaged(query);
  }

  /** סימון פנייה כטופלה / ביטול הסימון — צוות בלבד. */
  @Patch(":id/handled")
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  setHandled(@Param("id") id: string, @Body() dto: UpdateContactHandledDto) {
    return this.contactService.setHandled(id, dto.handled);
  }

  /** signed URL זמני לצפייה בקו"ח שצורף לפנייה — צוות בלבד. */
  @Get(":id/resume")
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  async resume(@Param("id") id: string) {
    const path = await this.contactService.getResumePath(id);
    const url = await this.storage.getSignedUrl(path);
    return { url };
  }
}
