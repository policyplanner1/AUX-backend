const pool = require('../config/db');

/** Simple age matcher:
 * - If input has 'm' (e.g., "12m"), require rowAge also has 'm' and match exact (ignoring spaces/case).
 * - If input has no 'm' (e.g., 12 or "12"), require rowAge has no 'm' and match exact as strings (trimmed).
 */
function ageSimpleMatch(rowAge, inputAge) {
  const rowStr = String(rowAge ?? '').trim().toLowerCase();
  const inStr  = String(inputAge ?? '').trim().toLowerCase();

  const rowHasM = rowStr.includes('m');
  const inHasM  = inStr.includes('m');

  if (inHasM && !rowHasM) return false;   // want months row, row is years → no
  if (!inHasM && rowHasM) return false;   // want years row, row is months → no

  // Exact string match after normalizing spaces/case
  // Also collapse inner spaces to be safe ("12 m" == "12m")
  const norm = s => s.replace(/\s+/g, '');
  return norm(rowStr) === norm(inStr);
}

class PremiumModel {
  static async findPremiumForMember(tableName, coverAmount, age, zone, noOfAdults, noOfChildren) {
    const columnName = `c_${coverAmount}`;
    if (!/^c_\d+$/.test(columnName)) {
      throw new Error('Invalid cover amount');
    }

    const [rows] = await pool.query(
      `SELECT Age, No_of_Adults, No_of_Children, Zone, \`${columnName}\` as premium
       FROM ?? WHERE Zone = ?`,
      [tableName, zone]
    );
    
// console.log('🔍 PremiumModel.findPremiumForMember - Queried rows:', rows.length);

    for (const row of rows) {
      const rowAdults =
        row.No_of_Adults != null
          ? parseInt(String(row.No_of_Adults).replace(/[^0-9]/g, ''), 10)
          : null;

      const rowChildren =
        row.No_of_Children != null
          ? parseInt(String(row.No_of_Children).replace(/[^0-9]/g, ''), 10)
          : null;

      const adultMatch = rowAdults == null || rowAdults === noOfAdults;
      const childMatch = rowChildren == null || rowChildren === noOfChildren;
      if (!adultMatch || !childMatch) continue;

      // 🔹 Simple age rule (no bands, no conversions)
      if (!ageSimpleMatch(row.Age, age)) continue;

      if (row.premium != null) {
        const premiumString = String(row.premium).replace(/[^0-9.]/g, '');
        const premium = parseFloat(premiumString);

        if (!Number.isNaN(premium)) {
          return Math.round(premium * 100) / 100; // keep base stable
        }
      }
    }
    return null;
  }
}

module.exports = PremiumModel;
