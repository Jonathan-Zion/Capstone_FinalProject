'use strict';

import Hapi from '@hapi/hapi';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { logger } from './src/utils/logger.js';
import { corsPlugin } from './middleware/cors.js';
import { authMiddleware } from './middleware/auth.js';

// Route modules
import { authRoutes } from './src/routes/auth.js';
import { productionRoutes } from './src/routes/production.js';
import { fleetRoutes } from './src/routes/fleet.js';
import { logisticsRoutes } from './src/routes/logistics.js';
import { attendanceRoutes } from './src/routes/attendance.js';
import { weatherRoutes } from './src/routes/weather.js';
import { aiRoutes } from './src/routes/ai.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 5000,
        host: '0.0.0.0',
        routes: {
            // CORS is handled by our plugin, but HAPI has built-in support too.
            // We'll disable HAPI's built-in CORS to use our custom plugin for more control
            // or we could configure it here:
            cors: false
        }
    });

    // Register plugins
    await server.register([
        Inert,
        Vision,
        corsPlugin,
        authMiddleware
    ]);

    // Register API Routes
    await server.register([
        authRoutes,
        productionRoutes,
        fleetRoutes,
        logisticsRoutes,
        attendanceRoutes,
        weatherRoutes,
        aiRoutes
    ]);

    // Global Error Handler
    server.ext('onPreResponse', (request, h) => {
        const response = request.response;
        if (response.isBoom) {
            const error = response;
            const statusCode = error.output.statusCode;

            // Log 500 errors
            if (statusCode >= 500) {
                logger.error(`Server Error: ${error.message}`);
            }
        }
        return h.continue;
    });

    // Request Logger
    server.events.on('response', (request) => {
        logger.request(
            request.method.toUpperCase(),
            request.path,
            request.response.statusCode || (request.response.isBoom ? request.response.output.statusCode : 200)
        );
    });

    // Health Check
    server.route({
        method: 'GET',
        path: '/health',
        options: {
            auth: false, // Public
            handler: (request, h) => {
                return {
                    status: 'ok',
                    uptime: process.uptime(),
                    timestamp: new Date().toISOString()
                };
            }
        }
    });

    // Root endpoint
    server.route({
        method: 'GET',
        path: '/',
        options: {
            auth: false,
            handler: (request, h) => {
                return {
                    message: 'Mining Operations API',
                    version: '1.0.0',
                    docs: '/documentation' // Placeholder for docs
                };
            }
        }
    });

    try {
        await server.start();
        logger.success(`Server running on ${server.info.uri}`);
    } catch (err) {
        logger.error(`Failed to start server: ${err.message}`);
        process.exit(1);
    }
};

process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    process.exit(1);
});

init();
