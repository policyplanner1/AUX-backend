const CompanyModel = require('../models/companyModel');
const PlanModel = require('../models/planModel');
const FeaturesModel = require('../models/featuresModel');
const PremiumModel = require('../models/premiumModel');

// Helper: cap any age > 90 to 90 for premium lookup
function capAgeForLookup(val) {
  const n = parseInt(val, 10);
  if (Number.isNaN(n)) return null;
  return Math.min(n, 86);
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

    // Basic validation
    if (!companyId || !planId || !coverAmount || !zone || age == null) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Fetch company, plan, features
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

    // Build table name
    const tableName = `${company.company_name}_${plan.plan_name}`
      .toLowerCase()
      .replace(/\s+/g, '_');

    // -------------------------------------------------
    // Build members array + count adults/children
    // -------------------------------------------------
    let noOfAdults = 0;
    let noOfChildren = 0;
    const members = [];

    if (age != null) {
      noOfAdults += 1;
      members.push({
        label: 'self',
        age: parseInt(age, 10),
        lookupAge: capAgeForLookup(age)
      });
    }

    if (sage != null) {
      noOfAdults += 1;
      members.push({
        label: 'spouse',
        age: parseInt(sage, 10),
        lookupAge: capAgeForLookup(sage)
      });
    }

    [c1age, c2age, c3age, c4age].forEach((a, idx) => {
      if (a != null) {
        noOfChildren += 1;
        members.push({
          label: `child${idx + 1}`,
          age: parseInt(a, 10),
          lookupAge: capAgeForLookup(a)
        });
      }
    });

    // Policy type
    const isIndividualPolicy =
      ((plan.policy_type && plan.policy_type.toLowerCase() === 'individual') ||
        members.length === 1);

    // -------------------------------------------------
    // ✅ Find eldest member age for 188 flow
    // -------------------------------------------------
    // eldestActualAge = max(actual age)
    // eldestLookupAge = capped version of that eldest
    let eldestActualAge = null;
    let eldestLookupAge = null;
    for (const m of members) {
      if (eldestActualAge === null || m.age > eldestActualAge) {
        eldestActualAge = m.age;
        eldestLookupAge = m.lookupAge;
      }
    }

    // Safety: if somehow no members (shouldn't happen because age is required)
    if (eldestLookupAge == null) {
      return res.status(400).json({ error: 'No valid ages provided' });
    }

    // -------------------------------------------------
    // Premium calculation branch
    // -------------------------------------------------
    let totalBasePremium = 0;
    let totalDiscountedPremium = 0;
    const premiumBreakdown = [];

    // ✅ CASE 1: planId == 176 → loop member by member and use static 9,1,0
    if (parseInt(planId, 10) === 176) {
      for (const member of members) {
        const basePremium = await PremiumModel.findPremiumForMember(
          tableName,
          coverAmount,
          member.lookupAge,
          9,            // static zone
          1,            // static adults
          0             // static children
        );

        if (basePremium == null) {
          return res.status(404).json({
            error: `No premium found for age ${member.lookupAge} (from actual ${member.age}) in static zone 9`
          });
        }

        // discount logic: currently *1 (no discount math applied)
        let discountedPremium = basePremium;
        if (!isIndividualPolicy) {
          // if you actually want 10% OFF do: basePremium * 0.9
          discountedPremium = basePremium * 1;
        }

        premiumBreakdown.push({
          label: member.label,
          age: member.age,
          basePremium,
          discountedPremium
        });

        totalBasePremium += basePremium;
        totalDiscountedPremium += discountedPremium;
      }

    }
    else if (parseInt(planId, 10) === 196) {

      const basePremium = await PremiumModel.findPremiumForMember(
        tableName,
        coverAmount,
        eldestLookupAge,
        9,               // STATIC ZONE 9
        noOfAdults,
        noOfChildren
      );

      if (basePremium == null) {
        return res.status(404).json({
          error: `No premium found for eldest age ${eldestLookupAge} in static zone 9`
        });
      }

      let discountedPremium = basePremium;

      premiumBreakdown.push({
        label: 'family',
        eldestAge: eldestActualAge,
        basePremium,
        discountedPremium
      });

      totalBasePremium = basePremium;
      totalDiscountedPremium = discountedPremium;

      // ----------------------------------------------------
      // CASE 3: All Other Plans → Normal CASE 2
      // ----------------------------------------------------
    }
    else {
      // We call DB ONCE using eldest age, and pass real zone / adults / children

      const basePremium = await PremiumModel.findPremiumForMember(
        tableName,
        coverAmount,
        eldestLookupAge,      // <- only eldest age goes to DB
        zone,                 // dynamic zone from req.body
        noOfAdults,           // total adults in family
        noOfChildren          // total kids in family
      );

      if (basePremium == null) {
        return res.status(404).json({
          error: `No premium found for eldest age ${eldestLookupAge} (from actual ${eldestActualAge}) in zone ${zone}`
        });
      }

      let discountedPremium = basePremium;
      if (!isIndividualPolicy) {
        discountedPremium = basePremium * 1; // keep same logic you had
      }

      // We return a single line in breakdown, representing the family premium
      premiumBreakdown.push({
        label: 'family',
        eldestAge: eldestActualAge,
        basePremium,
        discountedPremium
      });

      totalBasePremium = basePremium;
      totalDiscountedPremium = discountedPremium;
    }

    // Final response
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

  } catch (err) {
    console.error('Error calculating NIC premium:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
