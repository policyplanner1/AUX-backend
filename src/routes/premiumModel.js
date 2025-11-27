const pool = require('../config/db');

/**
 * Utility function to determine whether an age fits within an age band.
 * The age bands in the premium tables are stored as strings (e.g. "18-30", ">60").
 * This helper tries to parse a few common patterns.  If the pattern
 * cannot be parsed, it returns false.
 *
 * @param {string} band  The age band as stored in the table.
 * @param {number} age   The age to test.
 * @returns {boolean}
 */
function ageMatchesBand(band, age) {
  if (!band) return false;
  const trimmed = band.trim();
  // Handle single values like "0" or "50"
  if (/^\d+$/.test(trimmed)) {
    return age === parseInt(trimmed, 10);
  }
  // Handle ranges separated by '-' (e.g. "18-30")
  const rangeMatch = trimmed.match(/^(\d+)\s*[-–]\s*(\d+)$/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    return age >= min && age <= max;
  }
  // Handle open ended: ">60" or "60+"
  const greaterMatch = trimmed.match(/^[>]?\s*(\d+)\+?$/);
  if (greaterMatch) {
    const threshold = parseInt(greaterMatch[1], 10);
    return age >= threshold;
  }
  // If pattern unknown, perform a simple includes check
  return trimmed.includes(String(age));
}

/**
 * Model for fetching premium values from plan specific tables.  Each plan is
 * expected to have its own premium table where the columns follow the
 * conventions described in the problem statement: a text `Age` column,
 * columns named `c_<cover>` for each cover amount, `No_of_Adults`,
 * `No_of_Children`, `Zone` etc.
 */
class PremiumModel {
  /**
   * Get the premium for a single member from a plan specific table.
   *
   * The function loads all rows for the requested zone and filters them by
   * matching age and household composition (number of adults/children).  Once
   * the row is found, the appropriate cover amount column is returned.  If
   * no matching row is found `null` is returned.
   *
   * @param {string} tableName   Name of the premium table for the plan.
   * @param {number} coverAmount Sum insured (e.g. 500000).
   * @param {number} age         Age of the insured member.
   * @param {string|number} zone Zone code.
   * @param {number} noOfAdults  Number of adults in the policy.
   * @param {number} noOfChildren Number of children in the policy.
   * @returns {Promise<number|null>} The premium for the member or null.
   */
  static async findPremiumForMember(tableName, coverAmount, age, zone, noOfAdults, noOfChildren) {
    // Build column name for the sum insured. For example, 500000 → c_500000.
    const columnName = `c_${coverAmount}`;
    // Guard: ensure columnName is alphanumeric to prevent SQL injection.
    if (!/^c_\d+$/.test(columnName)) {
      throw new Error('Invalid cover amount');
    }
    // Query all rows for the given zone.
    const [rows] = await pool.query(
      `SELECT Age, No_of_Adults, No_of_Children, Zone, \`${columnName}\` as premium FROM ?? WHERE Zone = ?`,
      [tableName, zone]
    );
    // console.log(rows);
    
    // Iterate through rows to find a match.
    for (const row of rows) {
            // console.log(row.premium);
      // Parse number of adults/children.  Values may be stored as text.
      // Strip any non-numeric characters before parsing.
      const rowAdults =
        row.No_of_Adults != null
          ? parseInt(String(row.No_of_Adults).replace(/[^0-9]/g, ''), 10)
          : null;
      const rowChildren =
        row.No_of_Children != null
          ? parseInt(String(row.No_of_Children).replace(/[^0-9]/g, ''), 10)
          : null;
      // If the table stores null for adults/children, treat as wildcard and ignore the check.
      const adultMatch = rowAdults == null || rowAdults === noOfAdults;
      const childMatch = rowChildren == null || rowChildren === noOfChildren;
      if (!adultMatch || !childMatch) continue;
      // Check if age falls into the band.
      if (ageMatchesBand(row.Age, age)) {
        // Premium values may include commas or currency symbols (e.g. "59,300").
        // Remove any non-digit or non-decimal characters before parsing.
        if (row.premium != null) {
          const premiumString = String(row.premium).replace(/[^0-9.]/g, '');
          const premium = parseFloat(premiumString);
          if (!Number.isNaN(premium)) {
            
            return premium;
          }
        }
      }
    }
    return null;
  }
}

module.exports = PremiumModel;
