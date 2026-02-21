import jwt from "jsonwebtoken";

/**
 * Sign a JWT with the standard SitePilot payload shape.
 * @param {{ id: string, tenantId: string, role: string, plan: string }} payload
 * @returns {string} signed JWT
 */
const generateToken = (payload) => {
    return jwt.sign(
        {
            id: payload.id,
            tenantId: payload.tenantId,
            role: payload.role,
            plan: payload.plan,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

/**
 * Verify & decode a JWT.
 * @param {string} token
 * @returns {{ id: string, tenantId: string, role: string, plan: string }}
 * @throws if invalid or expired
 */
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

export { generateToken, verifyToken };
