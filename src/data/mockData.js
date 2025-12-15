import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper generic read/write
const readJSON = (fileName) => {
    try {
        const filePath = path.join(__dirname, fileName);
        if (!fs.existsSync(filePath)) {
            console.warn(`Warning: ${fileName} not found, returning null/empty.`);
            return null;
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading ${fileName}:`, err);
        return null;
    }
};

const writeJSON = (fileName, data) => {
    try {
        const filePath = path.join(__dirname, fileName);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(`Error writing ${fileName}:`, err);
    }
};

// --- USERS ---
export const readUsers = () => readJSON('users.json') || [];
export const writeUsers = (data) => writeJSON('users.json', data);

// For backward compatibility (though better to use functions)
export const users = readUsers();

export const findUserByEmail = (email) => {
    const current = readUsers();
    return current.find(u => u.email === email);
};

export const createUser = (userData) => {
    const current = readUsers();
    const newUser = {
        id: current.length + 1,
        ...userData,
        role: 'user'
    };
    current.push(newUser);
    writeUsers(current);
    return newUser;
};

export const updateUser = (id, updates) => {
    const current = readUsers();
    const index = current.findIndex(u => u.id === id);
    if (index === -1) return null;

    current[index] = { ...current[index], ...updates };
    writeUsers(current);
    return current[index];
};

// --- PRODUCTION ---
export const getProductionStats = () => readJSON('production.json');
export const updateProductionStats = (data) => writeJSON('production.json', data);
// Compatibility export (will be static at load time, deprecated)
export const productionStats = getProductionStats();

// --- FLEET ---
export const getFleetStatus = () => readJSON('fleet.json');
export const updateFleetStatus = (data) => writeJSON('fleet.json', data);
export const fleetStatus = getFleetStatus();

// --- LOGISTICS ---
export const getLogisticsChain = () => readJSON('logistics.json') || [];
export const updateLogisticsChain = (data) => writeJSON('logistics.json', data);
export const logisticsChain = getLogisticsChain();

// --- ATTENDANCE ---
export const getAttendanceRecords = () => readJSON('attendance.json') || [];
export const updateAttendanceRecords = (data) => writeJSON('attendance.json', data);
export const attendanceRecords = getAttendanceRecords();
