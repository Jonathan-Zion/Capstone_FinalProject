// CORS Configuration Plugin for HAPI
export const corsPlugin = {
    name: 'corsPlugin',
    version: '1.0.0',
    register: async (server, options) => {
        server.ext('onPreResponse', (request, h) => {
            const response = request.response;
            const origin = request.headers.origin;

            // Allow localhost and local network IPs dynamically
            const allowedOrigin = (origin && (
                origin.startsWith('http://localhost') ||
                origin.startsWith('http://127.0.0.1') ||
                origin.startsWith('http://192.168.1.101')
            )) ? origin : (process.env.FRONTEND_URL || 'http://localhost:5173');

            if (response.isBoom) {
                response.output.headers['Access-Control-Allow-Origin'] = allowedOrigin;
                response.output.headers['Access-Control-Allow-Credentials'] = 'true';
                response.output.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
                response.output.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
            } else {
                response.header('Access-Control-Allow-Origin', allowedOrigin);
                response.header('Access-Control-Allow-Credentials', 'true');
                response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            }

            return h.continue;
        });

        // Handle preflight OPTIONS requests
        server.route({
            method: 'OPTIONS',
            path: '/{any*}',
            handler: (request, h) => {
                return h.response().code(200);
            }
        });
    }
};
