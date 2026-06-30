import { Controller, Get } from "@nestjs/common";
import { StatsService } from "./stats.service";
import { Public } from "../../common/decorators/public.decorator";

/** מדדים ציבוריים לעמוד הבית — ספירות אגרגטיביות בלבד, חשוף לכולם. */
@Controller("stats")
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Public()
  @Get()
  getPublicStats() {
    return this.stats.getPublicStats();
  }
}
