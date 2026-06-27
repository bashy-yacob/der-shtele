import {
  Body,
  Controller,
  Delete,
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
import { AdPlacement } from "@prisma/client";
import { AdvertisementsService } from "./advertisements.service";
import { CreateAdvertisementDto } from "./dto/create-advertisement.dto";
import { UpdateAdvertisementDto } from "./dto/update-advertisement.dto";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { StorageService } from "../../common/storage/storage.service";
import { adImageUploadOptions } from "../../common/storage/ad-image-upload.options";

@Controller("advertisements")
export class AdvertisementsController {
  constructor(
    private readonly ads: AdvertisementsService,
    private readonly storage: StorageService,
  ) {}

  // ---- ציבורי ----

  /** מודעות חיות למיקום נתון — לאתר. חייב לבוא לפני routes עם ':id'. */
  @Public()
  @Get("public")
  findPublic(@Query("placement") placement: AdPlacement) {
    return this.ads.findPublic(placement);
  }

  // ---- פנימי (צוות) ----

  @Get("admin/all")
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  findAll() {
    return this.ads.findAll();
  }

  /** העלאת תמונת באנר (multipart) — מחזיר נתיב לשליחה ב-create/update. */
  @Post("image")
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  @UseInterceptors(FileInterceptor("image", adImageUploadOptions))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const path = await this.storage.uploadAdImage(file);
    return { path };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  create(@Body() dto: CreateAdvertisementDto) {
    return this.ads.create(dto);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  update(@Param("id") id: string, @Body() dto: UpdateAdvertisementDto) {
    return this.ads.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  remove(@Param("id") id: string) {
    return this.ads.remove(id);
  }
}
