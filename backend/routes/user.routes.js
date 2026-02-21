import { Router } from "express"
import { userLogin, userLogout } from "../controllers/auth.controllers.js";

const app = Router()


app.post("/login", userLogin)
app.post("/logout", userLogout)

const userRouter = app;
export default userRouter;