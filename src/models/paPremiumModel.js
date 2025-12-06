const pool = require("../config/db");

const paPremiumModel = {
  async getPremiumByCover(tableName, coverAmount, category) {
    const column = `c_${coverAmount}`;

    let query = `
      SELECT premium_type, \`${column}\` AS premium_value
      FROM ${tableName}
    `;

    const params = [];

    // ✔ Only add WHERE if category is provided
    if (category !== undefined && category !== null && category !== "") {
      query += ` WHERE category = ?`;
      params.push(category);
    }

    const [rows] = await pool.query(query, params);
    return rows;
  },
};

module.exports = paPremiumModel;
