import { getProductionStats, updateProductionStats } from '../data/mockData.js';
import { logger } from '../utils/logger.js';
import Joi from '@hapi/joi';

export const productionRoutes = {
    name: 'productionRoutes',
    version: '1.0.0',
    register: async (server, options) => {

        // GET /api/production/stats
        server.route({
            method: 'GET',
            path: '/api/production/stats',
            options: {
                handler: async (request, h) => {
                    try {
                        const stats = getProductionStats();
                        if (!stats) return h.response({ error: 'Data not found' }).code(404);

                        // Transform data to match array format used in frontend
                        const statsArray = [
                            { label: "Coal Output", value: stats.coalOutput.value, trend: stats.coalOutput.trend, status: stats.coalOutput.status },
                            { label: "Overburden", value: stats.overburden.value, trend: stats.overburden.trend, status: stats.overburden.status },
                            { label: "Crusher Util", value: stats.crusherUtil.value, trend: stats.crusherUtil.trend, status: stats.crusherUtil.status },
                            { label: "Fuel Burn", value: stats.fuelBurn.value, trend: stats.fuelBurn.trend, status: stats.fuelBurn.status },
                        ];

                        return h.response(statsArray).code(200);
                    } catch (error) {
                        logger.error(`Production stats error: ${error.message}`);
                        return h.response({ error: 'Internal Server Error' }).code(500);
                    }
                }
            }
        });

        // POST /api/production/update (Admin only in real app)
        server.route({
            method: 'POST',
            path: '/api/production/update',
            options: {
                validate: {
                    payload: Joi.object({
                        coalOutput: Joi.string().optional(),
                        overburden: Joi.string().optional(),
                        crusherUtil: Joi.string().optional(),
                        fuelBurn: Joi.string().optional()
                    })
                },
                handler: async (request, h) => {
                    try {
                        const { coalOutput, overburden, crusherUtil, fuelBurn } = request.payload;
                        const stats = getProductionStats();

                        if (!stats) return h.response({ error: 'Data not found' }).code(404);

                        if (coalOutput) stats.coalOutput.value = coalOutput;
                        if (overburden) stats.overburden.value = overburden;
                        if (crusherUtil) stats.crusherUtil.value = crusherUtil;
                        if (fuelBurn) stats.fuelBurn.value = fuelBurn;

                        stats.lastUpdated = new Date().toISOString();

                        updateProductionStats(stats);

                        return h.response({
                            message: 'Production stats updated',
                            stats: stats
                        }).code(200);
                    } catch (error) {
                        logger.error(`Update stats error: ${error.message}`);
                        return h.response({ error: 'Internal Server Error' }).code(500);
                    }
                }
            }
        });
    }
};
