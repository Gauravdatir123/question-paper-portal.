const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/register", (req, res) => {
  if (req.session.userId) return res.redirect("/");
  res.render("auth/register", { error: null });
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.render("auth/register", { error: "Passwords do not match" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.render("auth/register", { error: "Email already registered" });
    }

    const user = await User.create({ name, email, password });
    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userRole = user.role;

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.render("auth/register", { error: "Something went wrong. Try again." });
  }
});

router.get("/login", (req, res) => {
  if (req.session.userId) return res.redirect("/");
  res.render("auth/login", { error: null });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.render("auth/login", { error: "Invalid email or password" });
    }

    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userRole = user.role;

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.render("auth/login", { error: "Something went wrong. Try again." });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

module.exports = router;