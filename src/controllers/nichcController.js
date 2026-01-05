const CompanyModel = require("../models/companyModel");
const PlanModel = require("../models/planModel");
const FeaturesModel = require('../models/featuresModel');
const hcPremiumModel = require("../models/hcPremiumModel");

exports.getPremium = async (req, res) => {
  try {
    const { companyId, planId } = req.params;
    const { coverAmount, age, zone, noOfAdults, noOfChildren, noOfDays } = req.body;

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

    // console.log("Table Name:", tableName);

    // Fetch premium rows
    const premium = await hcPremiumModel.getPremiumByCover(tableName, coverAmount, age, 9, noOfAdults, noOfChildren, noOfDays);

    if (!premium) {
      return res.status(404).json({ error: "HC Premium data not found" });
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
