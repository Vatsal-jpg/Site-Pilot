import bcrypt from "bcrypt";
import prisma from "../utils/prisma.js"
import { generateAccessToken } from "../utils/tokens.js";

const userLogin = async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        return res.sendResponse(400, false, "Invalid Credentials")
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        return res.sendResponse(400, false, "Invalid Credentials")
    }

    const token = generateAccessToken("user", user.email);

    res.cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000
    });

    res.sendResponse(200, true, "User login successful.")
};

const userLogout = (req, res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });

    res.sendResponse(200, true, "User logout successful.")
};

export {
    userLogin,
    userLogout
};
