import cookieParser from "cookie-parser"
import express from "express"
import dotenv from "dotenv"
import userRouter from "./routes/user.routes.js"
import responseFormatter from "./middlewares/response.js"
import cors from "cors"

dotenv.config()
const app = express()

app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/user", userRouter);
app.use(responseFormatter)

app.listen(4000, () => {
    console.log("Server is running on port 4000")
})