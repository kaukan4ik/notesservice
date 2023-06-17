const { createUserSession, getUser} = require("../services/user");

const express = require("express");
const login = express.Router();

login.post("/", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.redirect(`/?authError=username or password must not be empty`);

  let user = await getUser(req.body.username, req.body.password);
  if (process.env.NODE_ENV ==='develop') console.log(user);
  if (!user) return res.redirect("./?authError=true");
  if (user && user.isBlock) return res.redirect(`./?authError=User ${user.username} is block.`);

  const session = await createUserSession(user.userId);
  res.cookie("session", session, { httpOnly: true });
  return res.redirect("./dashboard");

});

module.exports = login;
