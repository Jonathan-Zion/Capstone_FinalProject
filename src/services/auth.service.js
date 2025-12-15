import { findUserByEmail } from '../../data/mockData.js';
import { generateToken } from '../../middleware/auth.js';

export const loginService = async (email, password) => {
    // Find user by email
    const user = findUserByEmail(email);

    if (!user) {
        throw new Error('Invalid email or password');
    }

    // Check password (in production, use bcrypt.compare)
    if (user.password !== password) {
        throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken(user);

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        },
        token
    };
};
