import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Injectable()
export class AdminGuard extends JwtAuthGuard {
  canActivate(context: ExecutionContext): boolean {
    const isJwtValid = super.canActivate(context);
    if (!isJwtValid) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      throw new ForbiddenException('需要管理员权限');
    }

    return true;
  }
}
