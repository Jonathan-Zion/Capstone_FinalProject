import { analyzeConditions, executeAction } from '../services/aiService.js';
import Joi from '@hapi/joi';

export const aiRoutes = {
    name: 'aiRoutes',
    version: '1.0.0',
    register: async (server, options) => {

        // GET /api/ai/recommend
        server.route({
            method: 'GET',
            path: '/api/ai/recommend',
            options: {
                validate: {
                    query: Joi.object({
                        weather: Joi.string().default('Clear'),
                        roadCondition: Joi.string().valid('dry', 'wet', 'muddy').default('dry')
                    })
                },
                handler: async (request, h) => {
                    const weatherCondition = request.query.weather;
                    const roadCondition = request.query.roadCondition;
                    // Simulate weather object
                    const weather = { condition: weatherCondition };

                    const recommendation = analyzeConditions(weather, roadCondition);
                    return h.response(recommendation).code(200);
                }
            }
        });

        // POST /api/ai/execute
        server.route({
            method: 'POST',
            path: '/api/ai/execute',
            options: {
                validate: {
                    payload: Joi.object({
                        action: Joi.string().required()
                    })
                },
                handler: async (request, h) => {
                    const { action } = request.payload;
                    const result = executeAction(action);
                    return h.response(result).code(200);
                }
            }
        });
    }
};
