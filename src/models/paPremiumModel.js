const pool = require("../config/db");

const paPremiumModel = {
  async getPremiumByCover(tableName, coverAmount) {
    const column = `c_${coverAmount}`;

    const [rows] = await pool.query(
      `SELECT premium_type, \`${column}\` AS premium_value 
       FROM ${tableName}`
    );

    return rows;
  },
};

module.exports = paPremiumModel;
