const pool = require("../config/db");

const gmcPremiumModel = {
  async getPremiumByCover(
    tableName,
    coverAmount,
    age,
    zone,
    noOfAdults,
    noOfChildren,
    noOfDays
  ) {
    const column = `c_${Number(coverAmount)}`;

    // console.log("GMC Premium Params:", {
    //   tableName,
    //   coverAmount,
    //   age,
    //   zone,
    //   noOfAdults,
    //   noOfChildren
    // });

    let whereClauses = [];
    let values = [];

    // mandatory filters
    whereClauses.push("age = ?");
    values.push(age);

    whereClauses.push("zone = ?");
    values.push(zone);

    whereClauses.push("no_of_days = ?");
    values.push(noOfDays);

    // optional filters
    if (noOfAdults !== undefined && noOfAdults !== null) {
      whereClauses.push("No_of_Adults = ?");
      values.push(noOfAdults);
    }

    if (noOfChildren !== undefined && noOfChildren !== null) {
      whereClauses.push("No_of_Children = ?");
      values.push(noOfChildren);
    }

    const query = `
      SELECT \`${column}\` AS premium_value
      FROM ${tableName}
      WHERE ${whereClauses.join(" AND ")}
      LIMIT 1
    `;

    // console.log("GMC Premium Query:", query, values);

    const [rows] = await pool.query(query, values);

    return rows.length ? rows[0].premium_value : null;
  },
};

module.exports = gmcPremiumModel;
