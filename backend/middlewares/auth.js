import { verifyToken } from "./jwt.js";

const authMiddleware = (requiredRole) => {
    return (req, res, next) => {
        const token = req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        try {
            const decoded = verifyToken(token);

            if (requiredRole && decoded.role !== requiredRole) {
                return res.status(403).json({ message: "Forbidden" });
            }

            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
    };
};

export default authMiddleware;
