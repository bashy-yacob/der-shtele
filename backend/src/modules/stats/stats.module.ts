import { Module } from "@nestjs/common";
import { StatsController } from "./stats.controller";
import { StatsService } from "./stats.service";

// PrismaModule גלובלי — אין צורך לייבא אותו כאן.
@Module({
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
