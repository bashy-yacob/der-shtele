import {
  Controller,
  ForbiddenException,
  Headers,
  Post,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Public } from "../../common/decorators/public.decorator";
import { TasksService } from "./tasks.service";

/**
 * הפעלה ידנית/חיצונית של המשימות היומיות.
 * מאובטח ב-header `x-tasks-secret` מול TASKS_SECRET — כך scheduler חיצוני
 * (cron-job.org / GitHub Action) יכול לירות אותן גם כש-Render free ישן.
 */
@Controller("tasks")
export class TasksController {
  constructor(
    private readonly tasks: TasksService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post("run-daily")
  async runDaily(@Headers("x-tasks-secret") secret?: string) {
    const expected = this.config.get<string>("TASKS_SECRET");
    if (!expected || secret !== expected) {
      throw new ForbiddenException("גישה נדחתה");
    }
    return this.tasks.runDaily();
  }
}
