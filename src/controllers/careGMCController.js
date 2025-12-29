const CompanyModel = require("../models/companyModel");
const PlanModel = require("../models/planModel");
const FeaturesModel = require('../models/featuresModel');
const gmcPremiumModel = require("../models/gmcPremiumModel");

exports.getPremium = async (req, res) => {
  try {
    const { companyId, planId } = req.params;
    const { coverAmount, age, zone, sage, c1age, c2age, c3age, c4age } = req.body;

    if (!companyId || !planId || !coverAmount) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    // Validate company
    const company = await CompanyModel.findActiveById(companyId);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Validate plan
    const plan = await PlanModel.findActivePlan(companyId, planId);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    // Create dynamic table name
    const tableName = `${company.company_name}_${plan.plan_name}`
      .toLowerCase()
      .replace(/\s+/g, "_");

    console.log("Table Name:", tableName);

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

    // Fetch premium rows
    const premium = await gmcPremiumModel.getPremiumByCover(tableName, coverAmount, age, 9, noOfAdults, noOfChildren);

    if (!premium) {
      return res.status(404).json({ error: "GMC Premium data not found" });
    }


    // FEATURES
    const features = await FeaturesModel.findActiveFeatures(planId);
    if (!features) {
      return res.status(404).json({ error: "Features not found or inactive" });
    }

    return res.json({
      company: company.company_name,
      plan: plan.plan_name,
      logoUrl: company.logo,
      brochureUrl: plan.broucher,
      onePagerUrl: plan.onePager,
      otherDetails: plan.other_details,
      coverAmount,
      premium: premium,
      features,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
