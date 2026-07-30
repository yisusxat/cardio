import { Request } from 'express';

export interface AuditEventOptions {
  action: string;
  userId?: string | null;
  userRole?: string | null;
  resourceId?: string | null;
  status?: 'SUCCESS' | 'FAILED';
  details?: Record<string, unknown>;
  req?: Request;
}

export function logAuditEvent(options: AuditEventOptions): void {
  const {
    action,
    userId = 'ANONYMOUS',
    userRole = 'GUEST',
    resourceId,
    status = 'SUCCESS',
    details,
    req,
  } = options;

  const clientIp = req
    ? (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'UNKNOWN'
    : 'SYSTEM';

  const userAgent = req ? req.headers['user-agent'] || 'UNKNOWN' : 'SYSTEM';

  const auditRecord = {
    timestamp: new Date().toISOString(),
    event: 'SECURITY_AUDIT',
    action,
    status,
    userId,
    userRole,
    resourceId: resourceId || undefined,
    ip: clientIp,
    userAgent,
    ...(details ? { details } : {}),
  };

  // Structured JSON audit output (ready for CloudWatch / Datadog / Syslog ingest)
  console.log(`[AUDIT] ${JSON.stringify(auditRecord)}`);
}
