const pool = require('../config/db');

/**
 * Model for fetching companies from the database.
 */
class CompanyModel {
  /**
   * Get a company by its primary key.  Only active (status=1) companies
   * are returned.  If no company is found, `null` is returned.
   *
   * @param {number} companyId
   * @returns {Promise<Object|null>}
   */
  static async findActiveById(companyId) {
    const [rows] = await pool.query(
      'SELECT * FROM company_status WHERE company_id = ? AND status = 1 LIMIT 1',
      [companyId]
    );
    return rows.length > 0 ? rows[0] : null;
  }
}

module.exports = CompanyModel;