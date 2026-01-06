// src/models/hcPremiumModel.js
const pool = require("../config/db");

const hcPremiumModel = {
  async getPremiumByCover(tableName, coverAmount, age, zone, noOfAdults, noOfChildren, noOfDays) {
    const column = `c_${Number(coverAmount)}`;


    if (!/^c_\d+$/.test(column)) throw new Error("Invalid coverAmount column");
    if (!/^[a-z0-9_]+$/i.test(tableName)) throw new Error("Invalid table name");

    const whereClauses = [];
    const values = [];

    // ✅ Use EXACT column names from DB
    whereClauses.push("`Age` = ?");
    values.push(Number(age));

   const hasZone = zone !== undefined && zone !== null && String(zone).trim() !== "";
    if (hasZone) {
      whereClauses.push("`Zone` = ?");
      values.push(Number(zone));
    }

    whereClauses.push("`no_of_days` = ?");
    values.push(Number(noOfDays));

    if (noOfAdults !== undefined && noOfAdults !== null) {
      whereClauses.push("`no_of_Adult` = ?");
      values.push(Number(noOfAdults));
    }

    if (noOfChildren !== undefined && noOfChildren !== null) {
      whereClauses.push("`no_of_child` = ?");
      values.push(Number(noOfChildren));
    }

    const query = `
      SELECT \`${column}\` AS premium_value
      FROM \`${tableName}\`
      WHERE ${whereClauses.join(" AND ")}
      LIMIT 1
    `;

    const [rows] = await pool.query(query, values);
    return rows.length ? rows[0].premium_value : null;
  },
};

module.exports = hcPremiumModel;
