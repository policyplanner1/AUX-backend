const pool = require('../config/db');

/**
 * Model for fetching plans from the database.
 */
class PlanModel {
  /**
   * Get a plan by its company and plan identifier. Only active (status=1) plans
   * are returned. If no plan is found, `null` is returned.
   *
   * @param {number} companyId
   * @param {number} planId
   * @returns {Promise<Object|null>}
   */
  static async findActivePlan(companyId, planId) {
    const [rows] = await pool.query(
      'SELECT * FROM company_premium WHERE company_id = ? AND plan_id = ? AND status = 1 LIMIT 1',
      [companyId, planId]
    );
    return rows.length > 0 ? rows[0] : null;
  }
}

module.exports = PlanModel;