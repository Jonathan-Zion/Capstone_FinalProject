
import Joi from '@hapi/joi';
import { users, readUsers, findUserByEmail, createUser, updateUser } from '../data/mockData.js';
import { generateToken } from '../../middleware/auth.js';
import { logger } from '../utils/logger.js';

export const authRoutes = {
    name: 'authRoutes',
    version: '1.0.0',
    register: async (server, options) => {

        // POST /api/auth/signup
        server.route({
            method: 'POST',
            path: '/api/auth/signup',
            options: {
                auth: false, // Public route
                validate: {
                    payload: Joi.object({
                        name: Joi.string().min(3).required(),
                        email: Joi.string().email().required(),
                        password: Joi.string().min(6).required(),
                        role: Joi.string().optional()
                    })
                },
                handler: async (request, h) => {
                    try {
                        const { name, email, password } = request.payload;

                        // Check if user already exists
                        const existingUser = findUserByEmail(email);
                        if (existingUser) {
                            return h.response({
                                error: 'Conflict',
                                message: 'Email already registered'
                            }).code(409);
                        }

                        // Create new user
                        const newUser = createUser({ name, email, password });

                        // Generate token
                        const token = generateToken(newUser);

                        logger.info(`New user registered: ${email}`);

                        return h.response({
                            message: 'User registered successfully',
                            user: {
                                id: newUser.id,
                                name: newUser.name,
                                email: newUser.email,
                                role: newUser.role
                            },
                            token
                        }).code(201);

                    } catch (error) {
                        logger.error(`Signup error: ${error.message}`);
                        return h.response({ error: 'Internal Server Error' }).code(500);
                    }
                }
            }
        });

        // POST /api/auth/signin
        server.route({
            method: 'POST',
            path: '/api/auth/signin',
            options: {
                auth: false, // Public route
                validate: {
                    payload: Joi.object({
                        email: Joi.string().email().required(),
                        password: Joi.string().required()
                    })
                },
                handler: async (request, h) => {
                    try {
                        const { email, password } = request.payload;

                        // Find user
                        const user = findUserByEmail(email);
                        if (!user) {
                            return h.response({
                                error: 'Unauthorized',
                                message: 'Invalid email or password'
                            }).code(401);
                        }

                        // Check password (simple comparison for mock)
                        // In production, use bcrypt.compare(password, user.password)
                        if (user.password !== password) {
                            return h.response({
                                error: 'Unauthorized',
                                message: 'Invalid email or password'
                            }).code(401);
                        }

                        // Generate token
                        const token = generateToken(user);

                        logger.info(`User logged in: ${email}`);

                        return h.response({
                            message: 'Login successful',
                            user: {
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                role: user.role
                            },
                            token
                        }).code(200);

                    } catch (error) {
                        logger.error(`Signin error: ${error.message}`);
                        return h.response({ error: 'Internal Server Error' }).code(500);
                    }
                }
            }
        });

        // GET /api/auth/me
        server.route({
            method: 'GET',
            path: '/api/auth/me',
            options: {
                // auth: 'session' removed, handled by middleware
                handler: async (request, h) => {
                    // User is attached to request.auth.user by middleware
                    return h.response({
                        user: request.auth.user
                    }).code(200);
                }
            }
        });



        // PUT /api/auth/settings
        server.route({
            method: 'PUT',
            path: '/api/auth/settings',
            options: {
                validate: {
                    payload: Joi.object({
                        settings: Joi.object().required()
                    })
                },
                handler: async (request, h) => {
                    try {
                        const userId = request.auth.user.id;
                        const { settings } = request.payload;

                        // Get current user to merge settings
                        const allUsers = readUsers();
                        const currentUser = allUsers.find(u => u.id === userId);

                        if (!currentUser) {
                            return h.response({ error: 'User not found' }).code(404);
                        }

                        // Deep merge settings (simple version)
                        const updatedSettings = {
                            ...currentUser.settings,
                            ...settings,
                            notifications: { ...currentUser.settings?.notifications, ...settings.notifications },
                            system: { ...currentUser.settings?.system, ...settings.system }
                        };


                        const updatedUser = updateUser(userId, { settings: updatedSettings }); // Correct usage

                        if (!updatedUser) {
                            return h.response({ error: 'User update failed' }).code(500);
                        }

                        return h.response({
                            message: 'Settings updated successfully',
                            settings: updatedUser.settings
                        }).code(200);

                    } catch (error) {
                        logger.error(`Update settings error: ${error.message}`);
                        return h.response({ error: 'Internal Server Error' }).code(500);
                    }
                }
            }
        });
    }
};
