// middleware/authMiddleware.js
module.exports = function (req, res, next) {
  console.log("Session:", req.session);
  if (req.session.user && req.session.user.id) {
    return next();
  }
  res.status(401).json({ error: "Anda harus login untuk melakukan aksi ini" });
};
