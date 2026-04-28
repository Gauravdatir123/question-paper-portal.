exports.requireLogin = (req, res, next) => {
  if (!req.session.userId) return res.redirect("/login");
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.session.userId) return res.redirect("/login");
  if (req.session.userRole !== "admin") {
    return res.status(403).send("Access denied");
  }
  next();
};

exports.attachUser = (req, res, next) => {
  res.locals.currentUser = req.session.userId
    ? {
        id: req.session.userId,
        name: req.session.userName,
        role: req.session.userRole
      }
    : null;
  next();
};