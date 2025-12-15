import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export const authMiddleware = {
    name: 'authMiddleware',
    version: '1.0.0',
    register: async (server, options) => {
        server.ext('onPreAuth', (request, h) => {
            // Skip auth for public routes and OPTIONS requests (CORS preflight)
            const publicRoutes = ['/health', '/api/auth/signup', '/api/auth/signin'];
            if (publicRoutes.includes(request.path) || request.method === 'options') {
                return h.continue;
            }

            // Check for Authorization header
            const authHeader = request.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return h.response({
                    error: 'Unauthorized',
                    message: 'Missing or invalid authorization token'
                }).code(401).takeover();
            }

            // Verify JWT token
            const token = authHeader.substring(7);
            try {
                const decoded = jsonwebtoken.verify(token, JWT_SECRET);
                request.auth = { user: decoded };
                return h.continue;
            } catch (error) {
                return h.response({
                    error: 'Unauthorized',
                    message: 'Invalid or expired token'
                }).code(401).takeover();
            }
        });
    }
};

export const generateToken = (user) => {
    return jsonwebtoken.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};
