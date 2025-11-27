const CompanyModel = require('../models/companyModel');
const PlanModel = require('../models/planModel');
const FeaturesModel = require('../models/featuresModel');
const PremiumModel = require('../models/premiumModel');

// Helper: cap any age > 90 to 90 for premium lookup
function capAgeForLookup(val) {
  const n = parseInt(val, 10);
  if (Number.isNaN(n)) return null;
  return Math.min(n, 90);
}

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

    // Validate required fields
    if (!companyId || !planId || !coverAmount || !zone || age == null) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Fetch company and plan to ensure they are active
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

    // Derive the premium table name (adjust to your exact naming convention if needed)
    const tableName = `${company.company_name}_${plan.plan_name}`
      .toLowerCase()
      .replace(/\s+/g, '_');

    // Build members and count adults/children
    let noOfAdults = 0;
    let noOfChildren = 0;
    const members = [];

    if (age != null) {
      noOfAdults += 1;
      members.push({
        label: 'self',
        age: parseInt(age, 10),
        lookupAge: capAgeForLookup(age), // cap to 90 if needed
      });
    }
    if (sage != null) {
      noOfAdults += 1;
      members.push({
        label: 'spouse',
        age: parseInt(sage, 10),
        lookupAge: capAgeForLookup(sage),
      });
    }
    [c1age, c2age, c3age, c4age].forEach((a, idx) => {
      if (a != null) {
        noOfChildren += 1;
        members.push({
          label: `child${idx + 1}`,
          age: parseInt(a, 10),
          lookupAge: capAgeForLookup(a),
        });
      }
    });

    // Determine if policy is individual (explicit individual OR exactly one member)
    const isIndividualPolicy =
      ((plan.policy_type && plan.policy_type.toLowerCase() === 'individual') ||
        members.length === 1);

    // Identify eldest (first highest age wins if ties)
    const eldestAge = members.length
      ? [...members].sort((a, b) => b.age - a.age)[0].age
      : null;

    // Compute premiums
    let totalBasePremium = 0;
    let totalDiscountedPremium = 0;
    const premiumBreakdown = [];

    for (const member of members) {
      const basePremium = await PremiumModel.findPremiumForMember(
        tableName,
        coverAmount,
        member.lookupAge,   // use capped age for DB lookup
        zone,
        1,
        0
      );

      if (basePremium == null) {
        return res.status(404).json({
          error: `No premium found for age ${member.lookupAge} (from actual ${member.age}) in zone ${zone}`
        });
      }

      let discountedPremium = basePremium;
      if (!isIndividualPolicy) {
        // Eldest pays full premium; others get 55% discount → pay 45% of base
        if (member.age !== eldestAge) {
          discountedPremium = basePremium * 0.45;
        }
      }

      premiumBreakdown.push({
        label: member.label,
        age: member.age,             // actual age
        basePremium,
        discountedPremium
        // If you want, you can also surface: usedAge: member.lookupAge
      });

      totalBasePremium += basePremium;
      totalDiscountedPremium += discountedPremium;
    }

    return res.json({
      companyId,
      planId,
      planName: plan.plan_name,
      coverAmount,
      zone,
      noOfAdults,
      noOfChildren,
      isIndividualPolicy,
      premiumBreakdown,
      totalBasePremium,
      totalPayablePremium: totalDiscountedPremium,
      totalDiscount: totalBasePremium - totalDiscountedPremium,
      company,
      plan,
      features
    });
  } catch (error) {
    console.error('Error calculating HDFC premium:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
