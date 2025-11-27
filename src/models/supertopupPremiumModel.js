const pool = require("../config/db");
const { ageSimpleMatch } = require("./ageUtils");

class SuperTopupPremiumModel {
    static async findPremiumForSuperTopup(
        tableName,
        coverAmount,
        age,
        adults,
        children
    ) {
        const columnName = `c_${coverAmount}`;
        if (!/^c_\d+$/.test(columnName)) {
            throw new Error("Invalid cover amount");
        }

        // Deductible is selected but NOT filtered
        const [rows] = await pool.query(
            `SELECT Age, No_of_Adults, No_of_Children, Deductible,
              \`${columnName}\` AS premium
       FROM ??`,
            [tableName]
        );

        const matchedRows = [];

        for (const row of rows) {

            /* Adults / Children match */
            const rowAdults = row.No_of_Adults ? parseInt(row.No_of_Adults) : null;
            const rowChildren = row.No_of_Children ? parseInt(row.No_of_Children) : null;

            if (rowAdults !== null && rowAdults !== adults) continue;
            if (rowChildren !== null && rowChildren !== children) continue;

            /* Age match */
            if (!ageSimpleMatch(row.Age, age)) continue;

            /* Extract premium */
            if (row.premium != null) {
                const cleanPremium = parseFloat(String(row.premium).replace(/[^0-9.]/g, ""));

                if (!isNaN(cleanPremium)) {
                    matchedRows.push({
                        premium: cleanPremium,
                        deductible: row.Deductible || null
                    });
                }
            }
        }

        return matchedRows.length > 0 ? matchedRows : null;
    }
}

module.exports = SuperTopupPremiumModel;
