require("dotenv").config()
const express = require("express");
const nunjucks = require("nunjucks");
require("express-async-errors")
const login = require("./routes/login");
const signup = require("./routes/signup");
const logout = require("./routes/logout");
const api = require("./routes/api");
const auth = require("./middlewares/preAuth");
const checkAuth = require("./middlewares/clientCheckAuth");
const cookieParser = require("cookie-parser");
const app = express();
const info = require("debug")("app")

nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

app.set("view engine", "njk");

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/login", login);
app.use("/signup", signup);
app.use("/logout", auth(), logout);
app.use("/api", api);

app.get("/", auth(), (req, res) => {
  if (req.user) return res.redirect("./dashboard");
  res.render("index", {
    authError: req.query.authError === "true" ? "Wrong username or password" : req.query.authError,
  });
});

app.get("/dashboard", auth(),checkAuth(), (req, res) => {
  res.render("dashboard", {
    user: req.user.username,
  });
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  res.status(error.status || 500)
  info(error)
  if (process.env.NODE_ENV === 'develop') {
    res.json({
        status: error.status,
        message: error.message,
        stack: error.stack
    })
  } else {
    res.json({
      error: error.status  ?  error.message : 'Internal Server Error'
    })
  }

})


const port = process.env.PORT || 3000;
info(`NODE_ENV=${process.env.NODE_ENV}`)

app.listen(port, () => {
  console.log(`  Listening on http://localhost:${port}`);
});
