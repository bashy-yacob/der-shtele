import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * מגביל route לתפקידים מסוימים. נאכף ע"י RolesGuard.
 * שימוש: @Roles('staff', 'admin')
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
