const bcrypt = require("bcrypt");
const db = require("../database/db");
const { createEmailHash, createSecretKey } = require("../utils/hashUtils");

async function register(req, res) {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const hashSalt = createEmailHash(email);
    const secretKey = createSecretKey();

    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      db.run(
        `INSERT INTO users (email, password_hash, role)
         VALUES (?, ?, ?)`,
        [email.toLowerCase().trim(), passwordHash, role || "user"],
        function (err) {
          if (err) {
            db.run("ROLLBACK");
            return res.status(400).json({ message: "User already exists or invalid data" });
          }

          const userId = this.lastID;

          db.run(
            `INSERT INTO keygen_accounts (user_id, secret_key, hash_salt)
             VALUES (?, ?, ?)`,
            [userId, secretKey, hashSalt],
            function (err) {
              if (err) {
                db.run("ROLLBACK");
                return res.status(500).json({ message: "Failed to create keygen account" });
              }

              db.run(
                `INSERT INTO auth_logs (user_id, event_type, success, ip_address)
                 VALUES (?, ?, ?, ?)`,
                [userId, "login_success", 1, req.ip],
                function () {
                  db.run("COMMIT");

                  return res.status(201).json({
                    message: "User registered successfully",
                    user_id: userId,
                    email: email.toLowerCase().trim(),
                  });
                }
              );
            }
          );
        }
      );
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed" });
  }
}

module.exports = {
  register,
};
