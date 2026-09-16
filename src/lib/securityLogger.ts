/**
 * Security audit logger for Top Grade Rice Millers.
 * Logs structured security events while redacting passwords and sensitive credentials.
 */

export type SecurityEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'UNAUTHORIZED_ACCESS'
  | 'RATE_LIMIT_EXCEEDED'
  | 'PASSWORD_CHANGE'
  | 'SETTINGS_UPDATE'
  | 'FILE_UPLOAD'
  | 'FILE_UPLOAD_BLOCKED'
  | 'QUOTE_STATUS_UPDATE'
  | 'QUOTE_DELETE'
  | 'MESSAGE_STATUS_UPDATE'
  | 'MESSAGE_DELETE'
  | 'PRODUCT_MUTATION'
  | 'SERVICE_MUTATION';

interface SecurityEventDetails {
  ip?: string;
  email?: string;
  path?: string;
  method?: string;
  reason?: string;
  id?: string;
  filename?: string;
  [key: string]: unknown;
}

export function logSecurityEvent(
  type: SecurityEventType,
  details: SecurityEventDetails = {}
) {
  // Deep clone and sanitize sensitive keys
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(details)) {
    const lower = key.toLowerCase();
    if (
      lower.includes('password') ||
      lower.includes('token') ||
      lower.includes('secret') ||
      lower.includes('cookie')
    ) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }

  const logEntry = {
    timestamp: new Date().toISOString(),
    event: type,
    ...sanitized,
  };

  const formatted = `[SECURITY_AUDIT] ${JSON.stringify(logEntry)}`;

  if (
    type === 'LOGIN_FAILURE' ||
    type === 'UNAUTHORIZED_ACCESS' ||
    type === 'RATE_LIMIT_EXCEEDED' ||
    type === 'FILE_UPLOAD_BLOCKED'
  ) {
    console.warn(formatted);
  } else {
    console.info(formatted);
  }
}
