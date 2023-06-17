const { deleteSession } = require("../services/user");

const express = require("express");
const logout = express.Router();

logout.get("/", async (req, res) => {
  if (req.user) {
    await deleteSession(req.session);
    delete req.cookies["session"];
  }
  return res.redirect("./");
});

module.exports = logout;
