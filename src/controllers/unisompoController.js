const CompanyModel = require('../models/companyModel');
const PlanModel = require('../models/planModel');
const FeaturesModel = require('../models/featuresModel');
const PremiumModel = require('../models/premiumModel');

// Helper: cap any age > 86 to 86 for premium lookup (per your requirement)
function capAgeForLookup(val) {
  const n = parseInt(val, 10);
  if (Number.isNaN(n)) return null;
  return Math.min(n, 76);
}

/**
 * Controller to calculate premiums for the unisompo company.
 *
 * unisompo rule:
 * - Do NOT compute per-member premiums.
 * - Use a SINGLE premium cell based on:
 *     eldest age (capped at 86) + Zone + No_of_Adults + No_of_Children + Cover.
 * - No discount logic (pay 100% of the selected cell).
 */
exports.calculatePremium = async (req, res) => {
  try {
    const { companyId, planId } = req.params;
    const {
      coverAmount,
      zone,
      age,
      sage,
      c1age,
      c2age,
      c3age,
      c4age
    } = req.body;

    // Validate input
    if (!companyId || !planId || !coverAmount || !zone || age == null) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Fetch company and plan (must be active = status 1)
    const company = await CompanyModel.findActiveById(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found or inactive' });
    }
    const plan = await PlanModel.findActivePlan(companyId, planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found or inactive' });
    }
    const features = await FeaturesModel.findActiveFeatures(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Features not found or inactive' });
    }

    // Derive table name from company and plan names. Adjust per your schema.
    const tableName = `${company.company_name}_${plan.plan_name}`
      .toLowerCase()
      .replace(/\s+/g, '_');

    // Build members and counts
    let noOfAdults = 0;
    let noOfChildren = 0;
    const members = [];

    if (age != null) {
      noOfAdults += 1;
      members.push({ label: 'self', age: parseInt(age, 10) });
    }
    if (sage != null) {
      noOfAdults += 1;
      members.push({ label: 'spouse', age: parseInt(sage, 10) });
    }
    [c1age, c2age, c3age, c4age].forEach((a, idx) => {
      if (a != null) {
        noOfChildren += 1;
        members.push({ label: `child${idx + 1}`, age: parseInt(a, 10) });
      }
    });

    // Eldest age (actual) and lookup age (capped to 86)
    const eldestActualAge = members.length
      ? [...members].sort((a, b) => b.age - a.age)[0].age
      : parseInt(age, 10);

    const eldestLookupAge = capAgeForLookup(eldestActualAge);

    // Single DB lookup: eldest age (+cap), zone, composition, cover
    const basePremium = await PremiumModel.findPremiumForMember(
      tableName,
      coverAmount,
      eldestLookupAge,
      zone,
      noOfAdults,
      noOfChildren
    );

    if (basePremium == null) {
      return res.status(404).json({
        error: `No premium found for eldest lookup age ${eldestLookupAge} (from actual ${eldestActualAge}), zone ${zone}, adults ${noOfAdults}, children ${noOfChildren}`
      });
    }

    // unisompo: no discount (100% of base)
    const totalBasePremium = basePremium;
    const totalPayablePremium = basePremium;
    const totalDiscount = 0;

    return res.json({
      companyId,
      planId,
      planName: plan.plan_name,
      coverAmount,
      zone,
      noOfAdults,
      noOfChildren,
      eldestActualAge,
      eldestLookupAge,
      totalBasePremium,
      totalPayablePremium,
      totalDiscount,
      // Optional: echo members for reference (not used for pricing)
      members,
      company,
      plan,
      features
    });
  } catch (err) {
    console.error('Error calculating unisompo premium:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
