const CompanyModel = require('../models/companyModel');
const PlanModel = require('../models/planModel');
const FeaturesModel = require('../models/featuresModel');
const PremiumModel = require('../models/premiumModel');

// Helper: cap any age > 90 to 90 for premium lookup
function capAgeForLookup(val) {
  const n = parseInt(val, 10);
  if (Number.isNaN(n)) return null;
  return Math.min(n, 71); // <- you had 71 here, keeping same logic
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

    // 1. Check active company
    const company = await CompanyModel.findActiveById(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found or inactive' });
    }

    // 2. Check active plan
    const plan = await PlanModel.findActivePlan(companyId, planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found or inactive' });
    }

    // 3. Get features (optional block if you need it in response)
    const features = await FeaturesModel.findActiveFeatures(planId);
    if (!features) {
      return res
        .status(404)
        .json({ error: 'Features not found or inactive' });
    }

    // 4. Premium table name (company + plan)
    const tableName = `${company.company_name}_${plan.plan_name}`
      .toLowerCase()
      .replace(/\s+/g, '_');

    // 5. Build members array + count adults / children
    let noOfAdults = 0;
    let noOfChildren = 0;
    const members = [];

    if (age != null) {
      noOfAdults += 1;
      members.push({
        label: 'self',
        age: parseInt(age, 10),
        lookupAge: capAgeForLookup(age),
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

    // 6. Figure out policy type info (still returning this for frontend)
    const isIndividualPolicy =
      ((plan.policy_type && plan.policy_type.toLowerCase() === 'individual') ||
        members.length === 1);

    // 7. (Optional) eldest age, kept in case you still want it
    const eldestAge = members.length
      ? [...members].sort((a, b) => b.age - a.age)[0].age
      : null;

    // 8. Determine discount % for THIS family combo
    //
    // Rules:
    // - 1 adult, 0 children -> 0%
    // - 2+ adults, 0 children -> 22%
    // - any adults, exactly 1 child -> 28%
    // - any adults, 2+ children -> 32%
    //
    // Interpretation:
    // - "any number of adults with one child" also covers single parent + 1 kid
    // - "any number of adults with two child" also covers single parent + 2 kids, etc.
    //
    let discountPercent = 0;

    if (noOfChildren === 0) {
      if (noOfAdults === 1) {
        discountPercent = 0;
      } else if (noOfAdults >= 2) {
        discountPercent = 22;
      }
    } else if (noOfChildren === 1) {
      discountPercent = 28;
    } else if (noOfChildren >= 2) {
      discountPercent = 32;
    }

    // multiplier we'll apply on base premium
    const discountMultiplier = 1 - discountPercent / 100;

    // 9. Calculate premiums member-wise
    let totalBasePremium = 0;
    let totalDiscountedPremium = 0;
    const premiumBreakdown = [];

    for (const member of members) {
      const basePremium = await PremiumModel.findPremiumForMember(
        tableName,
        coverAmount,
        member.lookupAge, // capped age for DB lookup
        zone,
        1, // noOfAdults? (your table signature, keeping same as your code)
        0  // noOfChildren? (your table signature, keeping same as your code)
      );

      if (basePremium == null) {
        return res.status(404).json({
          error: `No premium found for age ${member.lookupAge} (from actual ${member.age}) in zone ${zone}`
        });
      }

      // apply the SAME discount % to everyone in the family
      const discountedPremium = basePremium * discountMultiplier;

      premiumBreakdown.push({
        label: member.label,
        age: member.age, // actual age
        basePremium,
        discountedPremium,
        // optional for debugging:
        // usedAge: member.lookupAge,
        // discountPercentApplied: discountPercent
      });

      totalBasePremium += basePremium;
      totalDiscountedPremium += discountedPremium;
    }

    // 10. Final response
    return res.json({
      companyId,
      planId,
      planName: plan.plan_name,
      coverAmount,
      zone,
      noOfAdults,
      noOfChildren,
      isIndividualPolicy,
      discountPercentApplied: discountPercent,
      premiumBreakdown,
      totalBasePremium,
      totalPayablePremium: totalDiscountedPremium,
      totalDiscount: totalBasePremium - totalDiscountedPremium,
      company,
      plan,
      features
    });
  } catch (error) {
    console.error('Error calculating premium:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
