const CompanyModel = require("../models/companyModel");
const PlanModel = require("../models/planModel");
const paPremiumModel = require("../models/paPremiumModel");

exports.getPremium = async (req, res) => {
  try {
    const { companyId, planId } = req.params;
    const { coverAmount } = req.body;

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

    // Fetch premium rows
    const rows = await paPremiumModel.getPremiumByCover(tableName, coverAmount);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Premium data not found" });
    }

    // Extract base + addon
    const base = rows.find(r => r.premium_type === "basic")?.premium_value || 0;
    const addon = rows.find(r => r.premium_type === "addon")?.premium_value || 0;

    return res.json({
      company: company.company_name,
      plan: plan.plan_name,
      logoUrl: company.logo,
      brochureUrl: plan.broucher,
      onePagerUrl: plan.onePager,
      otherDetails: plan.other_details,
      coverAmount,
      base,
      addon,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
