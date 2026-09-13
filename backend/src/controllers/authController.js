const { authenticateUser, destroySession } = require("../services/ivyService");

/**
 * POST /api/auth/login
 * Authenticate credentials against Ivy Homes API and establish session
 */
async function loginUser(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        error: "Both email and password are required",
        code: "INVALID_INPUT"
      });
    }

    const { user, sessionId } = await authenticateUser(email, password);

    // Set secure HTTP-only cookie
    res.cookie("ivy_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      success: true,
      message: "Login successful",
      user,
      token: sessionId
    });
  } catch (error) {
    const status = error.status || 401;
    res.status(status).json({
      error: error.message || "Invalid credentials",
      code: "AUTH_FAILED"
    });
  }
}

/**
 * GET /api/auth/me
 * Check active session status for the current client
 */
async function getCurrentUser(req, res) {
  res.json({
    authenticated: true,
    user: req.user
  });
}

/**
 * POST /api/auth/logout
 * Invalidate session and clear HTTP-only cookie
 */
async function logoutUser(req, res) {
  const sessionId = req.sessionId || req.cookies?.ivy_session;
  if (sessionId) {
    destroySession(sessionId);
  }

  res.clearCookie("ivy_session", {
    httpOnly: true,
    sameSite: "lax"
  });

  res.json({
    success: true,
    message: "Logged out successfully"
  });
}

module.exports = {
  loginUser,
  getCurrentUser,
  logoutUser
};
