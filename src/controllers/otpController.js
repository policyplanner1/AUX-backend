const db = require("../config/db");
const axios = require("axios");

// SEND OTP
exports.sendOTP = async (req, res) => {
  const { mobile } = req.body;

//   console.log("📩 Incoming Send OTP request:", req.body);

  if (!mobile) {
    return res.status(400).json({ success: false, message: "Mobile number required" });
  }

  try {
    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // console.log("🔢 Generated OTP:", otp);
    // console.log("⏳ OTP expires at:", expiresAt);

    // ------------------------------
    // CHECK IF MOBILE EXISTS (AWAIT)
    // ------------------------------
    const [existingRows] = await db.query(
      "SELECT * FROM otp_verifications WHERE mobile = ?",
      [mobile]
    );

    // console.log("📌 SELECT result:", existingRows);

    if (existingRows.length > 0) {
      const existing = existingRows[0];

      if (existing.attempts >= 3) {
        // console.log("⛔ Too many OTP attempts");
        return res.json({
          success: false,
          message: "Too many OTP attempts. Try later.",
        });
      }

    //   console.log("🛠 Updating OTP for:", mobile);

      await db.query(
        "UPDATE otp_verifications SET otp = ?, expires_at = ?, attempts = attempts + 1 WHERE mobile = ?",
        [otp, expiresAt, mobile]
      );
    } else {
      // console.log("🆕 Inserting new mobile:", mobile);

      await db.query(
        "INSERT INTO otp_verifications (mobile, otp, expires_at, attempts) VALUES (?, ?, ?, 1)",
        [mobile, otp, expiresAt]
      );
    }

    // ------------------------------
    // SMS SENDING
    // ------------------------------
    const smsURL = `http://bhashsms.com/api/sendmsg.php?user=polcyp&pass=123456&sender=POLCYP&phone=${encodeURIComponent(
      mobile
    )}&text=Your+OTP+is+${otp}+and+is+valid+for+15+minutes.+Please+use+this+OTP+to+verify+your+account.+-+Team+Policyplanner+-+Policy+Planner&priority=ndnd&stype=normal`;

    // console.log("📨 SMS API URL:", smsURL);

    const response = await axios.get(smsURL);

    // console.log("📩 SMS Response:", response.data);
    if (/^S\.\d+/.test(response.data)) {
    // if (true) {

      return res.json({ success: true, message: "OTP sent successfully Bypassed" });
    } else {
      return res.json({ success: false, message: "SMS sending failed", api: response.data });
    }

  } catch (error) {
    console.log("❌ ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};


exports.verifyOTP = async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ success: false, message: "Mobile & OTP required" });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM otp_verifications WHERE mobile = ? AND otp = ? AND expires_at > NOW()",
      [mobile, otp]
    );

    // console.log("🔍 Verify OTP result:", rows);

    if (rows.length === 0) {
      return res.json({ valid: false });
    }

    await db.query("UPDATE otp_verifications SET is_verified = 1 WHERE mobile = ?", [mobile]);

    return res.json({ valid: true });

  } catch (error) {
    console.log("❌ VERIFY OTP ERROR:", error);
    return res.status(500).json({ valid: false });
  }
};

