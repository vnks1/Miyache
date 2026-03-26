import prisma from '../../db/client.js';

export type AuditAction =
  | 'create'
  | 'update'
  | 'archive'
  | 'unarchive'
  | 'delete'
  | 'sync'
  | 'publish'
  | 'unpublish'
  | 'import';

export class AuditService {
  /**
   * Registra uma ação no audit log
   */
  async log(params: {
    userId: string;
    entity: string;
    entityId: string;
    action: AuditAction;
    before?: unknown;
    after?: unknown;
  }) {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        entity: params.entity,
        entityId: params.entityId,
        action: params.action,
        beforeJson: params.before ? JSON.stringify(params.before) : null,
        afterJson: params.after ? JSON.stringify(params.after) : null,
      },
    });
  }

  /**
   * Busca histórico de audit logs
   */
  async getRecent(limit = 50) {
    return await prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Busca audit logs de uma entidade específica
   */
  async getByEntity(entity: string, entityId: string) {
    return await prisma.auditLog.findMany({
      where: {
        entity,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });
  }
}

export const auditService = new AuditService();
