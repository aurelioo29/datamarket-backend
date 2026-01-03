import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // kalau akses @GetUser('sub')
    if (data) return user?.[data];

    // kalau akses @GetUser()
    return user;
  },
);
