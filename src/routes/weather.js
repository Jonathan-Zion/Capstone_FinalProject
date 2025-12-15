import { logger } from '../utils/logger.js';

export const weatherRoutes = {
    name: 'weatherRoutes',
    version: '1.0.0',
    register: async (server, options) => {

        // GET /api/weather/current
        // This acts as a proxy to the external weather API if needed, 
        // or returns cached/mock data to reduce external calls
        server.route({
            method: 'GET',
            path: '/api/weather/current',
            options: {
                handler: async (request, h) => {
                    try {
                        // In a real app, we might fetch from Open-Meteo here
                        // For now, we'll return a structure similar to what the frontend expects
                        // or what the frontend processes

                        // Mock weather data for Kalimantan mining site
                        const mockWeather = {
                            latitude: -0.5022,
                            longitude: 117.1536,
                            current: {
                                temperature_2m: 32.5,
                                relative_humidity_2m: 78,
                                weather_code: 61, // Rain
                                wind_speed_10m: 12.5,
                                is_day: 1,
                                time: new Date().toISOString()
                            }
                        };

                        return h.response(mockWeather).code(200);

                    } catch (error) {
                        logger.error(`Weather error: ${error.message}`);
                        return h.response({ error: 'Internal Server Error' }).code(500);
                    }
                }
            }
        });
    }
};
