const { getUserBySession } = require("../services/user");
const preAuth = () => async (req, res, next) => {
  if (req.cookies && req.cookies["session"]) {
    const user = await getUserBySession(req.cookies["session"]);
    if (user) {
      req.user = user;
      req.session = req.cookies["session"];
    }
  }
  next();
};

module.exports = function () {
  return preAuth();
};
