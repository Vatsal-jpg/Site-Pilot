import jwt from "jsonwebtoken";

const generateAccessToken = (role, email) => {
    return jwt.sign(
        { role, email },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );
};

const verifyToken = (role, token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== role) {
            return { valid: false, reason: "Unauthorized role" };
        }

        return { valid: true, data: decoded };
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return { valid: false, reason: "Token expired" };
        }

        return { valid: false, reason: "Invalid token" };
    }
};

export { generateAccessToken, verifyToken };
