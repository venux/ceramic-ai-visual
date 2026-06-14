import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { configuration } from '../../config/configuration';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('缺少 Authorization header');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('无效的 Authorization 格式');
    }

    try {
      const secret = configuration().jwt_secret;
      const payload = jwt.verify(token, secret);
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token 无效或已过期');
    }
  }
}