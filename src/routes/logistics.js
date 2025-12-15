import { getLogisticsChain, updateLogisticsChain } from '../data/mockData.js';
import { logger } from '../utils/logger.js';
import Joi from '@hapi/joi';

export const logisticsRoutes = {
    name: 'logisticsRoutes',
    version: '1.0.0',
    register: async (server, options) => {

        // GET /api/logistics/chain
        server.route({
            method: 'GET',
            path: '/api/logistics/chain',
            options: {
                handler: async (request, h) => {
                    try {
                        const chain = getLogisticsChain();
                        return h.response(chain).code(200);
                    } catch (error) {
                        logger.error(`Logistics chain error: ${error.message}`);
                        return h.response({ error: 'Internal Server Error' }).code(500);
                    }
                }
            }
        });

        // PUT /api/logistics/stage/{stage}/status
        server.route({
            method: 'PUT',
            path: '/api/logistics/stage/{stage}/status',
            options: {
                validate: {
                    params: Joi.object({
                        stage: Joi.string().required()
                    }),
                    payload: Joi.object({
                        status: Joi.string().required(),
                        time: Joi.string().optional(),
                        flow: Joi.string().valid('optimal', 'delayed', 'standby').required()
                    })
                },
                handler: async (request, h) => {
                    try {
                        const { stage } = request.params;
                        const { status, time, flow } = request.payload;

                        // Flexible matching for URL params (decode URI component)
                        const decodedStage = decodeURIComponent(stage);

                        const chain = getLogisticsChain();

                        const stageIndex = chain.findIndex(item =>
                            item.stage.toLowerCase() === decodedStage.toLowerCase()
                        );

                        if (stageIndex === -1) {
                            return h.response({ error: 'Not Found', message: 'Logistics stage not found' }).code(404);
                        }

                        // Update stage
                        chain[stageIndex].status = status;
                        chain[stageIndex].flow = flow;
                        if (time) chain[stageIndex].time = time;

                        updateLogisticsChain(chain);

                        return h.response({
                            message: 'Stage status updated',
                            stage: chain[stageIndex]
                        }).code(200);

                    } catch (error) {
                        logger.error(`Update logistics error: ${error.message}`);
                        return h.response({ error: 'Internal Server Error' }).code(500);
                    }
                }
            }
        });
    }
};
