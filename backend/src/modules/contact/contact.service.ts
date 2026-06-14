import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateContactDto } from './dto/create-contact.dto';

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
        <p><b>${dto.name}</b> (${dto.phone}) — ${dto.inquiry_type}</p>
        <p>${dto.message}</p>
        ${resumePath ? '<p>צורפו קורות חיים.</p>' : ''}
      </div>`,
    );

    return { ok: true };
  }

  findAll() {
    return this.prisma.contact.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
