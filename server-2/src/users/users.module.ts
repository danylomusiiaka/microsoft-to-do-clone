import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';

import { UsersService } from './users.service';
import { DocumentUserPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';
import { AuthService } from '@/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '@/mail/mail.service';
import { MailerService } from '@/mailer/mailer.service';

@Module({
  imports: [DocumentUserPersistenceModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthService,
    JwtService,
    MailService,
    MailerService,
  ],
  exports: [UsersService, DocumentUserPersistenceModule],
})
export class UsersModule {}
