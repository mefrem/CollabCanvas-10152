export const requireAuth = (req, res, next) => {
  console.log("🔐 Auth check:", {
    isAuthenticated: req.isAuthenticated(),
    hasSession: !!req.session,
    sessionID: req.sessionID,
    hasUser: !!req.user,
    cookies: req.headers.cookie ? "✅ Present" : "❌ Missing",
  });

  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
};

export const optionalAuth = (req, res, next) => {
  // Middleware that doesn't require auth but passes user if available
  next();
};
