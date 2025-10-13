import pool from '../config/database';

interface AuditLogEntry {
  user_id?: number;
  action: string;
  entity_type: string;
  entity_id?: number;
  old_data?: any;
  new_data?: any;
  ip_address?: string;
}

export class AuditService {
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO audit_log 
         (user_id, action, entity_type, entity_id, old_data, new_data, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          entry.user_id || null,
          entry.action,
          entry.entity_type,
          entry.entity_id || null,
          entry.old_data ? JSON.stringify(entry.old_data) : null,
          entry.new_data ? JSON.stringify(entry.new_data) : null,
          entry.ip_address || null
        ]
      );
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }
  
  async getAuditTrail(entityType: string, entityId: number) {
    const result = await pool.query(
      `SELECT 
        al.*,
        u.email,
        u.first_name,
        u.last_name
       FROM audit_log al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.entity_type = $1 AND al.entity_id = $2
       ORDER BY al.created_at DESC`,
      [entityType, entityId]
    );
    
    return result.rows;
  }
}

export default new AuditService();


