const crypto = require("crypto");
const hash = (str) => {
  return crypto.createHash("md5").update(str).digest("hex");
};

module.exports = hash;
