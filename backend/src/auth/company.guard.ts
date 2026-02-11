import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

/**
 * CompanyGuard — valida que o header x-company-id pertence ao usuário autenticado.
 * Deve ser usado APÓS JwtAuthGuard.
 *
 * Se o header não for enviado, lança BadRequestException.
 * Se o usuário não pertence à empresa, lança ForbiddenException.
 */
@Injectable()
export class CompanyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const companyId = request.headers['x-company-id'];

    if (!companyId) {
      throw new BadRequestException('Header x-company-id é obrigatório');
    }

    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    const userCompanies: any[] = user.companies || [];
    const hasAccess = userCompanies.some(
      (c: any) => c.id === companyId || c.companyId === companyId,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'Você não tem acesso a esta empresa',
      );
    }

    return true;
  }
}
