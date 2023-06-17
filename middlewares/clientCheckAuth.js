const clientCheckAuth = () => async (req, res, next) => {
  if (!req.user) return res.redirect("./");
  if (req.user.isBlock) return res.redirect(`./?authError=User ${req.user.username} is block.`);
  next();
};

module.exports = function () {
  return clientCheckAuth();
};
