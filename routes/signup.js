const { newUser, createUserSession, existsUser } = require("../services/user");
const express = require("express");
const signup = express.Router();

signup.post("/", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) return res.redirect(`/?authError=username or password must not be empty`);

  if (await existsUser(username))
        return res.redirect(`./?authError=User ${username} already exists`);

  const userId = await newUser(username, password);
  const session = await createUserSession(userId);
  res.cookie("session", session, { httpOnly: true });
  return res.redirect("./dashboard");
});

module.exports = signup;
