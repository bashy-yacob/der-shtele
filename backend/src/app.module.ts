import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './common/storage/storage.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

import { JobsModule } from './modules/jobs/jobs.module';
import { CandidatesModule } from './modules/candidates/candidates.module';
import { EmployersModule } from './modules/employers/employers.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { PlacementsModule } from './modules/placements/placements.module';
import { CommissionsModule } from './modules/commissions/commissions.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { ContactModule } from './modules/contact/contact.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { MailingModule } from './modules/mailing/mailing.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    EmailModule,
    AuthModule,
    JobsModule,
    CandidatesModule,
    EmployersModule,
    ApplicationsModule,
    PlacementsModule,
    CommissionsModule,
    RemindersModule,
    ContactModule,
    DashboardModule,
    MailingModule,
  ],
  controllers: [AppController],
  providers: [
    // הגנת JWT גלובלית — כל route מוגן אלא אם סומן ב-@Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
