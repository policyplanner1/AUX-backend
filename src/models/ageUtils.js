/**
 * Simple age matcher:
 *
 * Rules:
 * - If inputAge has 'm' → rowAge must also have 'm'  (months)
 * - If inputAge does NOT have 'm' → rowAge must NOT have 'm' (years)
 * - Remove whitespace (e.g. "12 m" == "12m")
 * - Compare lowercase strings
 */
function ageSimpleMatch(rowAge, inputAge) {
  const rowStr = String(rowAge ?? "").trim().toLowerCase();
  const inStr = String(inputAge ?? "").trim().toLowerCase();

  const rowHasM = rowStr.includes("m");
  const inHasM = inStr.includes("m");

  // Years vs Months mismatch → fail immediately
  if (inHasM && !rowHasM) return false;
  if (!inHasM && rowHasM) return false;

  // Normalize: remove all inner spaces → "12 m" → "12m"
  const normalize = (s) => s.replace(/\s+/g, "");

  return normalize(rowStr) === normalize(inStr);
}

module.exports = { ageSimpleMatch };
