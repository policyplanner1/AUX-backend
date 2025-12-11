const CompanyModel = require('../models/companyModel');
const PlanModel = require('../models/planModel');
const FeaturesModel = require('../models/featuresModel');
const SuperTopupPremiumModel = require('../models/supertopupPremiumModel');

// Cap age for premium lookup
function capAgeForLookup(val) {
    const n = parseInt(val, 10);
    if (Number.isNaN(n)) return null;
    return Math.min(n, 71);
}

exports.calculateIFFCOSuperTopupPremium = async (req, res) => {
    try {
        const { companyId, planId } = req.params;
        // console.log("request", req.body);

        const {
            coverAmount,
            age,
            sage,
            c1age,
            c2age,
            c3age,
            c4age
        } = req.body;

        // BASIC VALIDATION
        if (!companyId || !planId || !coverAmount || age == null) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // COMPANY
        const company = await CompanyModel.findActiveById(companyId);
        if (!company) {
            return res.status(404).json({ error: "Company not found or inactive" });
        }

        // PLAN
        const plan = await PlanModel.findActivePlan(companyId, planId);
        if (!plan) {
            return res.status(404).json({ error: "Plan not found or inactive" });
        }

        // FEATURES
        const features = await FeaturesModel.findActiveFeatures(planId);
        if (!features) {
            return res.status(404).json({ error: "Features not found or inactive" });
        }

        // TABLE NAME: hdfc_planname
        const tableName = `${company.company_name}_${plan.plan_name}`
            .toLowerCase()
            .replace(/\s+/g, "_");

        // MEMBERS - count adults / children
        let adults = 1;
        let children = 0;

        const members = [{ label: "self", age: parseInt(age) }];

        if (sage != null) {
            adults++;
            members.push({ label: "spouse", age: parseInt(sage) });
        }

        const kids = [c1age, c2age, c3age, c4age];
        kids.forEach((c, i) => {
            if (c != null) {
                children++;
                members.push({ label: `child${i + 1}`, age: parseInt(c) });
            }
        });

        // Eldest age
        const eldestActual = Math.max(...members.map(m => m.age));
        const eldestLookup = capAgeForLookup(eldestActual);

        // HDFC SUPER TOPUP PREMIUM LOOKUP
        const premiumRows = await SuperTopupPremiumModel.findPremiumForSuperTopup(
            tableName,
            coverAmount,
            eldestLookup,
            adults,
            children
        );

        if (!premiumRows) {
            return res.status(404).json({ error: "No premiums found" });
        }

        // SUCCESS RESPONSE
        return res.json({
            message: "iffco Super Top-Up Premium Calculated",
            companyId,
            companyName: company.company_name,
            logoUrl: company.logo,
            brochureUrl: plan.broucher,
            planId,
            planName: plan.plan_name,
            coverAmount,
            adults,
            children,
            eldestActual,
            eldestLookup,
            premiums: premiumRows,
            members,
            otherDetails: plan.other_details,
            features
        });

    } catch (err) {
        console.error("iffco SuperTopup Error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
