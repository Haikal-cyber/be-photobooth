import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtValidatedUser } from './jwt-payload.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtValidatedUser => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtValidatedUser }>();
    return request.user;
  },
);
