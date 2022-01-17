const crypto = require("crypto");

const generateSeed = () => {
  return crypto.randomBytes(32).toString("hex");
};

const sha256 = (payload) => {
  return crypto.createHash("sha256").update(payload).digest("hex");
};

const calcNumber = (payload, secret) => {
  const hmac = crypto
    .createHmac("sha512", secret)
    .update(payload)
    .digest("hex");

  const f6 = hmac.substr(0, 6);
  return Math.round(parseInt(f6, 16) / 466033.75);
};

module.exports = {
  generateSeed,
  sha256,
  calcNumber,
};
