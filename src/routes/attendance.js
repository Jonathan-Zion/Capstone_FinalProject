import { getAttendanceRecords, updateAttendanceRecords } from '../data/mockData.js';
import { logger } from '../utils/logger.js';
import Joi from '@hapi/joi';

export const attendanceRoutes = {
    name: 'attendanceRoutes',
    version: '1.0.0',
    register: async (server, options) => {

        // GET /api/attendance/records
        server.route({
            method: 'GET',
            path: '/api/attendance/records',
            options: {
                handler: async (request, h) => {
                    try {
                        const { date, shift, department } = request.query;
                        const records = getAttendanceRecords();

                        let filteredRecords = [...records];

                        if (date) {
                            filteredRecords = filteredRecords.filter(r => r.date === date);
                        }
                        if (shift) {
                            filteredRecords = filteredRecords.filter(r => r.shift === shift);
                        }
                        if (department) {
                            filteredRecords = filteredRecords.filter(r =>
                                r.department.toLowerCase().includes(department.toLowerCase())
                            );
                        }

                        return h.response(filteredRecords).code(200);
                    } catch (error) {
                        logger.error(`Attendance records error: ${error.message}`);
                        return h.response({ error: 'Internal Server Error' }).code(500);
                    }
                }
            }
        });

        // POST /api/attendance/checkin
        server.route({
            method: 'POST',
            path: '/api/attendance/checkin',
            options: {
                validate: {
                    payload: Joi.object({
                        employeeId: Joi.string().required(),
                        employeeName: Joi.string().required(),
                        department: Joi.string().required(),
                        shift: Joi.string().required()
                    })
                },
                handler: async (request, h) => {
                    try {
                        const { employeeId, employeeName, department, shift } = request.payload;
                        const records = getAttendanceRecords();

                        // Check if already checked in today
                        const today = new Date().toISOString().split('T')[0];
                        const existing = records.find(r =>
                            r.employeeId === employeeId && r.date === today
                        );

                        if (existing) {
                            return h.response({
                                error: 'Conflict',
                                message: 'Employee already checked in today'
                            }).code(409);
                        }

                        const now = new Date();
                        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

                        const newRecord = {
                            id: records.length + 1,
                            employeeId,
                            employeeName,
                            department,
                            shift,
                            date: today,
                            checkIn: timeString,
                            checkOut: null,
                            status: 'present'
                        };

                        records.push(newRecord);
                        updateAttendanceRecords(records);

                        return h.response({
                            message: 'Check-in successful',
                            record: newRecord
                        }).code(201);

                    } catch (error) {
                        logger.error(`Check-in error: ${error.message}`);
                        return h.response({ error: 'Internal Server Error' }).code(500);
                    }
                }
            }
        });

        // POST /api/attendance/checkout
        server.route({
            method: 'POST',
            path: '/api/attendance/checkout',
            options: {
                validate: {
                    payload: Joi.object({
                        employeeId: Joi.string().required()
                    })
                },
                handler: async (request, h) => {
                    try {
                        const { employeeId } = request.payload;
                        const today = new Date().toISOString().split('T')[0];

                        const records = getAttendanceRecords();

                        const record = records.find(r =>
                            r.employeeId === employeeId && r.date === today
                        );

                        if (!record) {
                            return h.response({
                                error: 'Not Found',
                                message: 'No check-in record found for today'
                            }).code(404);
                        }

                        if (record.checkOut) {
                            return h.response({
                                error: 'Conflict',
                                message: 'Employee already checked out'
                            }).code(409);
                        }

                        const now = new Date();
                        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

                        record.checkOut = timeString;

                        updateAttendanceRecords(records);

                        return h.response({
                            message: 'Check-out successful',
                            record
                        }).code(200);

                    } catch (error) {
                        logger.error(`Check-out error: ${error.message}`);
                        return h.response({ error: 'Internal Server Error' }).code(500);
                    }
                }
            }
        });
    }
};
