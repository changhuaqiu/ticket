import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    // 公开路径不需要认证
    const publicPaths = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/health', '/api/docs'];
    if (publicPaths.includes(request.path)) {
      return true;
    }
    return super.canActivate(context);
  }
}
