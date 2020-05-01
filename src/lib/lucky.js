const crypto = require("crypto");

const generateSeed = () => {
  let text = "";
  const possible = "abcdef0123456789";

  for (let i = 0; i < 64; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const sha256 = payload => {
  return crypto
    .createHash("sha256")
    .update(payload)
    .digest("hex");
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
  calcNumber
};
