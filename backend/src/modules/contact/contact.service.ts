import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { escapeHtml } from '../../common/util/escape-html';

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  /** פנייה מטופס "צור קשר". resumePath אופציונלי (הועלה מראש). */
  async create(dto: CreateContactDto, resumePath: string | null) {
    await this.prisma.contact.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        inquiry_type: dto.inquiry_type,
        message: dto.message,
        resumePath,
      },
    });

    await this.email.notifyTeam(
      'פנייה חדשה מהאתר',
      `<div dir="rtl">
        <p><b>${escapeHtml(dto.name)}</b> (${escapeHtml(dto.phone)}) — ${escapeHtml(dto.inquiry_type)}</p>
        <p>${escapeHtml(dto.message).replace(/\n/g, '<br/>')}</p>
        ${resumePath ? '<p>צורפו קורות חיים.</p>' : ''}
      </div>`,
    );

    return { ok: true };
  }

  findAll() {
    return this.prisma.contact.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
