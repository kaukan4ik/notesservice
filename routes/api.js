const express = require("express");
const api = express.Router();
const notes = require("./notes");
const auth = require("../middlewares/preAuth");
const checkAuth = require("../middlewares/apiCheckAuth");

api.all("*", auth(),checkAuth());
api.use("/notes", notes);

module.exports = api;
