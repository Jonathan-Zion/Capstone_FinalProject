import { getFleetStatus, updateFleetStatus } from '../data/mockData.js';
import { logger } from '../utils/logger.js';
import Joi from '@hapi/joi';

export const fleetRoutes = {
    name: 'fleetRoutes',
    version: '1.0.0',
    register: async (server, options) => {

        // GET /api/fleet/status
        server.route({
            method: 'GET',
            path: '/api/fleet/status',
            options: {
                handler: async (request, h) => {
                    try {
                        const status = getFleetStatus();
                        // Return summary status
                        return h.response({
                            active: status.active,
                            standby: status.standby,
                            maintenance: status.maintenance,
                            breakdown: status.breakdown
                        }).code(200);
                    } catch (error) {
                        logger.error(`Fleet status error: ${error.message}`);
                        return h.response({ error: 'Internal Server Error' }).code(500);
                    }
                }
            }
        });

        // GET /api/fleet/vehicles
        server.route({
            method: 'GET',
            path: '/api/fleet/vehicles',
            options: {
                handler: async (request, h) => {
                    try {
                        const status = getFleetStatus();
                        return h.response(status.vehicles).code(200);
                    } catch (error) {
                        logger.error(`Fleet vehicles error: ${error.message}`);
                        return h.response({ error: 'Internal Server Error' }).code(500);
                    }
                }
            }
        });

        // PUT /api/fleet/vehicles/{id}/status
        server.route({
            method: 'PUT',
            path: '/api/fleet/vehicles/{id}/status',
            options: {
                validate: {
                    params: Joi.object({
                        id: Joi.string().required()
                    }),
                    payload: Joi.object({
                        status: Joi.string().valid('active', 'standby', 'maintenance', 'breakdown').required(),
                        location: Joi.string().optional()
                    })
                },
                handler: async (request, h) => {
                    try {
                        const { id } = request.params;
                        const { status, location } = request.payload;

                        const currentFleet = getFleetStatus();
                        const vehicleIndex = currentFleet.vehicles.findIndex(v => v.id === id);

                        if (vehicleIndex === -1) {
                            return h.response({ error: 'Not Found', message: 'Vehicle not found' }).code(404);
                        }

                        // Update stats counts (simplified logic for mock)
                        const oldStatus = currentFleet.vehicles[vehicleIndex].status;
                        if (oldStatus !== status) {
                            currentFleet[oldStatus]--;
                            currentFleet[status]++;
                        }

                        // Update vehicle
                        currentFleet.vehicles[vehicleIndex].status = status;
                        if (location) currentFleet.vehicles[vehicleIndex].location = location;

                        updateFleetStatus(currentFleet);

                        return h.response({
                            message: 'Vehicle status updated',
                            vehicle: currentFleet.vehicles[vehicleIndex]
                        }).code(200);

                    } catch (error) {
                        logger.error(`Update vehicle error: ${error.message}`);
                        return h.response({ error: 'Internal Server Error' }).code(500);
                    }
                }
            }
        });
    }
};
