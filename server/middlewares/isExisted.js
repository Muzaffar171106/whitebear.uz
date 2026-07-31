import jwt from "jsonwebtoken";

const sendErrorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({ message });
};


export const isExisted = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/Bearer\s?/, "");

  if (!token) return sendErrorResponse(res, 403, "Access not allowed! ⛔");

  try {
    const decoded = jwt.verify(token, process.env.JWTSECRET_KEY);
    req.userInfo = { userId: decoded._id, role: decoded.role };
    next();
  } catch (err) {
    console.error("JWT Error:", err);
    return sendErrorResponse(res, 401, "Invalid token 🔑");
  }
};

export const verifyRole = (roles = []) => (req, res, next) => {
  if (!roles.includes(req.userInfo.role)) {
    return sendErrorResponse(res, 403, "Access denied ❌");
  }
  next();
};
