const checkAuth = () => async (req, res, next) => {
  //console.log(req)
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

module.exports = function () {
  return checkAuth();
};
