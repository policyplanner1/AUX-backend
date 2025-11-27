const pool = require('../config/db');

/**
 * Model for fetching plans from the database.
 */
class FeaturesModel {
  /**
   * Get a plan by its company and plan identifier. Only active (status=1) plans
   * are returned. If no plan is found, `null` is returned.
   *
   * @param {number} planId
   * @returns {Promise<Object|null>}
   */
  static async findActiveFeatures(planId) {
    const [rows] = await pool.query(
      'SELECT * FROM health_coverages WHERE plan_id = ?',
      [planId]
    );
    return rows;
  }
}

module.exports = FeaturesModel;