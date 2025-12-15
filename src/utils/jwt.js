import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export const generateToken = (payload) => {
    return jwt.sign(payload, ENV.JWT_SECRET, {
        expiresIn: "1d",
    });
};

export const verifyToken = (token) => {
    return jwt.verify(token, ENV.JWT_SECRET);
};
