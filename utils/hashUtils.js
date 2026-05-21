const crypto = require("crypto");

function createEmailHash(email) {
  return crypto
    .createHash("sha256")
    .update(email.toLowerCase().trim())
    .digest("hex");
}

function createSecretKey() {
  return crypto.randomBytes(32).toString("hex");
}

module.exports = {
  createEmailHash,
  createSecretKey,
};
