// controllers/companies.controller.js
const pool = require('../config/db'); // mysql2/promise pool

/**
 * GET /api/companies/health-plans
 * Optional query: ?policy=Health  (defaults to 'Health')
 * Response JSON:
 * {
 *   "success": true,
 *   "count": 3,
 *   "policy_filter": "Health",
 *   "data": [{ "api_type": "REST" }, { "api_type": "STATIC" }, { "api_type": "SCRAPER" }]
 * }
 */
exports.getActiveCompaniesWithPlans = async (req, res) => {
  const policyQuery = (req.query.policy).trim();

  const sql = `
    SELECT cp.api_type
    FROM company_status cs
    INNER JOIN company_premium cp ON cp.company_id = cs.company_id
    WHERE cs.status = 1
      AND cp.plan_type LIKE CONCAT('%', ?, '%')
      AND cp.status = 1
      AND cp.api_type IS NOT NULL
      AND cp.api_type <> ''
  `;

  try {
    const [rows] = await pool.execute(sql, [policyQuery]);

    // Unique, trimmed api_type values
    const apiTypes = [...new Set(rows
      .map(r => String(r.api_type).trim())
      .filter(Boolean))];

    // Wrap as JSON object (not a bare array)
    return res.status(200).json({
      success: true,
      count: apiTypes.length,
      policy_filter: policyQuery,
      data: apiTypes.map(t => ({ api_type: t })),
    });
  } catch (err) {
    console.error('[getActiveCompaniesWithPlans] Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch api types.',
      error: err.message,
    });
  }
};
