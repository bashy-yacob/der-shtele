import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { StorageService } from '../../common/storage/storage.service';

@Controller('contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly storage: StorageService,
  ) {}

  /** טופס צור קשר — multipart עם קו"ח אופציונלי. */
  @Public()
  @Post()
  @UseInterceptors(FileInterceptor('resume'))
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
  @Roles('staff', 'admin')
  findAll() {
    return this.contactService.findAll();
  }
}
