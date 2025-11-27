// controllers/proposalController.js
const pool = require('../config/db'); // this is your mysql2/promise pool

exports.createProposal = async (req, res) => {
  const data = req.body;

  console.log('Received proposal data:', data);

  const {
    productName,
    selectedProductType,
    pincode,
    cityState,
    zone,
    upgradeZone,
    adultCount,
    childCount,
    proposerName,
    proposerDOB,
    proposerGender,
    proposerEmail,
    proposerPhone,
    sumInsured,
    selectedTenure,
    annualIncome,
    nriDiscount,
    includeSelf,
    bureauDiscount,
    aadharNumber,
    panNumber,
    basePremium,
    gstAmount,
    totalPremium,
    adults = [],
    children = []
  } = data;

  let connection;

  try {
    // 1) Get a connection from the pool
    connection = await pool.getConnection();

    // 2) Start transaction
    await connection.beginTransaction();

    // 3) Insert into health_proposals
    const insertProposalSql = `
      INSERT INTO health_proposals (
        product_name,
        selected_product_type,
        pincode,
        city_state,
        zone,
        upgrade_zone,
        adult_count,
        child_count,
        proposer_name,
        proposer_dob,
        proposer_gender,
        proposer_email,
        proposer_phone,
        sum_insured,
        selected_tenure,
        annual_income,
        nri_discount,
        include_self,
        bureau_discount,
        aadhar_number,
        pan_number,
        base_premium,
        gst_amount,
        total_premium
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    const proposalValues = [
      productName,
      selectedProductType,
      pincode,
      cityState,
      zone,
      upgradeZone,
      adultCount,
      childCount,
      proposerName,
      proposerDOB,
      proposerGender,
      proposerEmail,
      proposerPhone,
      sumInsured,
      selectedTenure,
      annualIncome,
      nriDiscount,
      includeSelf,
      bureauDiscount,
      aadharNumber,
      panNumber,
      basePremium,
      gstAmount,
      totalPremium
    ];

    const [proposalResult] = await connection.query(insertProposalSql, proposalValues);
    const proposalId = proposalResult.insertId;

    // 4) Prepare members data (adults + children)
    const membersData = [];

    adults.forEach((adult) => {
      membersData.push([
        proposalId,
        'adult',
        adult.relationship || null,
        adult.title || null,
        adult.fullName || null,
        adult.dob || null,
        adult.height || null,
        adult.weight || null,
        adult.abhaId || null,
        adult.preExistingDisease || null,
        adult.medicalCondition || null
      ]);
    });

    children.forEach((child) => {
      membersData.push([
        proposalId,
        'child',
        child.relationship || 'child',
        null, // title
        child.fullName || null,
        child.dob || null,
        child.height || null,
        child.weight || null,
        null, // abha_id
        null, // pre_existing_disease
        child.medicalCondition || null
      ]);
    });

    // 5) Insert members if any
    if (membersData.length > 0) {
      const insertMembersSql = `
        INSERT INTO health_proposal_members (
          proposal_id,
          member_type,
          relationship,
          title,
          full_name,
          dob,
          height,
          weight,
          abha_id,
          pre_existing_disease,
          medical_condition
        )
        VALUES ?
      `;

      await connection.query(insertMembersSql, [membersData]);
    }

    // 6) Commit transaction
    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Proposal and insured members saved successfully',
      proposalId
    });
  } catch (error) {
    console.error('Error creating proposal:', error);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error('Error during rollback:', rollbackErr);
      }
    }
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error while saving proposal'
    });
  } finally {
    if (connection) connection.release();
  }
};
