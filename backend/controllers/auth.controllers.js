import bcrypt from "bcrypt";
import prisma from "../utils/prisma.js";
import { generateToken } from "../utils/tokens.js";
import slugify from "../utils/slugify.js";

// ─────────────────────────────────────────
// POST /api/auth/signup
// ─────────────────────────────────────────
const signup = async (req, res) => {
    try {
        const { orgName, name, email, password, plan } = req.body;

        // 1. Validate required fields
        if (!orgName || !name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required (orgName, name, email, password)",
            });
        }

        // Basic email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
            });
        }

        // 2. Check email not already taken
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered",
            });
        }

        // 3. Hash password
        const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 4. Slugify org name
        let slug = slugify(orgName);

        // 5. Check slug uniqueness, append random suffix if taken
        const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
        if (existingTenant) {
            const suffix = Math.random().toString(36).substring(2, 6);
            slug = `${slug}-${suffix}`;
        }

        // 6. Validate plan
        const validPlans = ["starter", "pro", "enterprise"];
        const selectedPlan = validPlans.includes(plan) ? plan : "starter";

        // 7. Prisma transaction — create Tenant + User
        const result = await prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    orgName,
                    slug,
                    plan: selectedPlan,
                    storageUsedBytes: 0,
                    aiCreditsUsed: 0,
                },
            });

            const user = await tx.user.create({
                data: {
                    tenantId: tenant.id,
                    name,
                    email,
                    passwordHash,
                    role: "owner",
                },
            });

            return { tenant, user };
        });

        // 8. Sign JWT
        const token = generateToken({
            id: result.user.id,
            tenantId: result.tenant.id,
            role: "owner",
            plan: selectedPlan,
        });

        // 9. Send response
        return res.status(201).json({
            success: true,
            token,
            user: {
                id: result.user.id,
                name: result.user.name,
                role: result.user.role,
            },
            tenant: {
                id: result.tenant.id,
                orgName: result.tenant.orgName,
                slug: result.tenant.slug,
                plan: result.tenant.plan,
            },
        });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ─────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // 1. Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // 2. Compare password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // 3. Fetch tenant for plan info
        const tenant = await prisma.tenant.findUnique({
            where: { id: user.tenantId },
        });

        if (!tenant) {
            return res.status(500).json({ success: false, message: "Tenant not found" });
        }

        // 4. Sign JWT
        const token = generateToken({
            id: user.id,
            tenantId: tenant.id,
            role: user.role,
            plan: tenant.plan,
        });

        // 5. Send response
        return res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
            },
            tenant: {
                id: tenant.id,
                orgName: tenant.orgName,
                slug: tenant.slug,
                plan: tenant.plan,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { signup, login };
