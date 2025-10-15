export const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
};

export const optionalAuth = (req, res, next) => {
  // Middleware that doesn't require auth but passes user if available
  next();
};
