const { validateSession } = require("../services/ivyService");

/**
 * Authentication middleware requiring a valid session cookie or Authorization Bearer token
 */
function requireAuth(req, res, next) {
  let sessionId = req.cookies?.ivy_session;

  // Also support Authorization: Bearer <sessionId> for API testing and curl
  if (!sessionId && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
      sessionId = parts[1];
    }
  }

  if (!sessionId) {
    return res.status(401).json({
      error: "Authentication required to access this resource",
      code: "UNAUTHORIZED"
    });
  }

  const user = validateSession(sessionId);

  if (!user) {
    return res.status(401).json({
      error: "Session expired or invalid. Please log in again.",
      code: "SESSION_EXPIRED"
    });
  }

  req.user = user;
  req.sessionId = sessionId;
  next();
}

module.exports = {
  requireAuth
};
