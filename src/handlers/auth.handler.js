import { loginService } from "../services/auth.service.js";

export const loginHandler = async (request, h) => {
    try {
        const { email, password } = request.payload;

        if (!email || !password) {
            return h
                .response({ message: "Email & password required" })
                .code(400);
        }

        const result = await loginService(email, password);

        return h.response({
            status: "success",
            message: "Login success",
            data: result,
        });
    } catch (err) {
        return h
            .response({
                status: "fail",
                message: err.message,
            })
            .code(401);
    }
};
