import { Global, Module } from "@nestjs/common";
import { ShabbatService } from "./shabbat.service";

/** זמין גלובלית — נצרך ע"י EmailService, MailingService וג'ובים מתוזמנים. */
@Global()
@Module({
  providers: [ShabbatService],
  exports: [ShabbatService],
})
export class ShabbatModule {}
