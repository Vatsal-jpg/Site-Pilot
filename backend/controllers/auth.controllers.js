import bcrypt from "bcrypt";
import prisma from "../utils/prisma.js";
import { generateToken } from "../utils/tokens.js";
import slugify from "../utils/slugify.js";

// ─────────────────────────────────────────
// POST /api/auth/signup
// ─────────────────────────────────────────
export const signup = async (req, res) => {
    try {
        const { orgName, name, email, password, plan } = req.body;

        if (!orgName || !name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required (orgName, name, email, password)",
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
            });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered",
            });
        }

        const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        let slug = slugify(orgName);

        const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
        if (existingTenant) {
            const suffix = Math.random().toString(36).substring(2, 6);
            slug = `${slug}-${suffix}`;
        }

        const validPlans = ["starter", "pro", "enterprise"];
        const selectedPlan = validPlans.includes(plan) ? plan : "starter";

        const result = await prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: orgName,
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
                    password: passwordHash, // new schema maps it simply here
                    passwordHash: passwordHash, // left here for legacy compatibility if needed
                    role: "owner",
                },
            });

            return { tenant, user };
        });

        const token = generateToken({
            id: result.user.id,
            userId: result.user.id,
            tenantId: result.tenant.id,
            role: "owner",
            plan: selectedPlan,
        });

        return res.status(201).json({
            success: true,
            token,
            user: {
                id: result.user.id,
                name: result.user.name,
                email: result.user.email,
                role: result.user.role,
            },
            tenant: {
                id: result.tenant.id,
                orgName: result.tenant.orgName,
                name: result.tenant.name,
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
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const actualHash = user.password || user.passwordHash;
        const isValid = await bcrypt.compare(password, actualHash);
        if (!isValid) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { id: user.tenantId },
        });

        if (!tenant) {
            return res.status(500).json({ success: false, message: "Tenant not found" });
        }

        const token = generateToken({
            id: user.id,
            userId: user.id,
            tenantId: tenant.id,
            role: user.role,
            plan: tenant.plan,
        });

        return res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            tenant: {
                id: tenant.id,
                orgName: tenant.orgName,
                name: tenant.name,
                slug: tenant.slug,
                plan: tenant.plan,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
