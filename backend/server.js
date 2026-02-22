import "dotenv/config"
import cookieParser from "cookie-parser"
import express from "express"
import cors from "cors"

// Route imports
import authRouter from "./routes/auth.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import projectsRouter from "./routes/projects.routes.js"
import templatesRouter from "./routes/templates.routes.js"
import assetsRouter from "./routes/assets.routes.js"
import builderRouter from "./routes/builder.routes.js"
import aiRouter from "./routes/ai.routes.js"
import sitesRouter from "./routes/sites.routes.js"
import teamRouter from "./routes/team.routes.js"
import tenantRouter from "./routes/tenant.routes.js"
import billingRouter from "./routes/billing.routes.js"
import brandingRouter from "./routes/branding.routes.js"
import path from "path"

// Middleware imports
import responseFormatter from "./middlewares/response.js"
const app = express()

// Global middleware
app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))
app.use(responseFormatter) // must be BEFORE routes so res.sendResponse is available

// Routes
app.use("/api/auth", authRouter)
app.use("/api/dashboard", dashboardRouter)
app.use("/api/projects", projectsRouter)
app.use("/api/templates", templatesRouter)
app.use("/api/assets", assetsRouter)
app.use("/api/builder", builderRouter)
app.use("/api/ai", aiRouter)
app.use("/api/sites", sitesRouter)
app.use("/api/team", teamRouter)
app.use("/api/tenant", tenantRouter)
app.use("/api/billing", billingRouter)
app.use("/api/sites", brandingRouter)

// Health check
app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "Server is running", timestamp: new Date().toISOString() })
})

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err)
    res.status(500).json({ success: false, message: "Internal server error" })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})