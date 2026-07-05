import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { PartnersService } from "./partners.service";
import { CreatePartnerDto } from "./dto/create-partner.dto";
import { UpdatePartnerDto } from "./dto/update-partner.dto";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { StorageService } from "../../common/storage/storage.service";
import { partnerLogoUploadOptions } from "../../common/storage/partner-logo-upload.options";

@Controller("partners")
export class PartnersController {
  constructor(
    private readonly partners: PartnersService,
    private readonly storage: StorageService,
  ) {}

  // ---- ציבורי ----

  /** שותפים פעילים — לאתר. חייב לבוא לפני routes עם ':id'. */
  @Public()
  @Get("public")
  findPublic() {
    return this.partners.findPublic();
  }

  // ---- פנימי (צוות) ----

  @Get("admin/all")
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  findAll() {
    return this.partners.findAll();
  }

  /** העלאת לוגו שותף (multipart) — מחזיר נתיב לשליחה ב-create/update. */
  @Post("logo")
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  @UseInterceptors(FileInterceptor("logo", partnerLogoUploadOptions))
  async uploadLogo(@UploadedFile() file: Express.Multer.File) {
    const path = await this.storage.uploadPartnerLogo(file);
    return { path };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  create(@Body() dto: CreatePartnerDto) {
    return this.partners.create(dto);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  update(@Param("id") id: string, @Body() dto: UpdatePartnerDto) {
    return this.partners.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  remove(@Param("id") id: string) {
    return this.partners.remove(id);
  }
}
