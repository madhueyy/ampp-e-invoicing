// @ts-nocheck

// File handles authentication of users including
// registering and logging in

import express from 'express';

import { getUserUsingEmail, createUser } from '../db/users';
import { generateRandomString, hashPassword } from '../helpers';

/**
 * Registers a new user with provided email, password, and username
 * @param {express.Request} req - request object containing user data in req.body
 * @param {express.Response} res - response object to send HTTP responses
 * @returns {Promise<express.Response>} a Promise resolving to an HTTP response
 */
const registerUser = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password, username } = req.body;

        // No email, password or username given
        if (!email || !password || !username) {
            return res.sendStatus(400);
        }

        const existingUser = await getUserUsingEmail(email);

        // Conflict if user already exists
        if (existingUser) {
            return res.sendStatus(400);
        }

        // Generate a random string for salt and then hash the password
        const salt = generateRandomString();
        const hashedPassword = hashPassword(salt, password);

        const newUser = await createUser({
            email,
            username,
            authentication: {
                salt,
                password: hashedPassword,
            },
        });

        // Return newly registered user
        return res.status(200).json(newUser).end();
    } catch (error) {
        // Internal server error
        console.error(error);
        return res.sendStatus(500);
    }
}

/**
 * Logs in a user with provided email and password
 * @param {express.Request} req - request object containing user data in req.body
 * @param {express.Response} res - response object to send HTTP responses
 * @returns {Promise<express.Response>} a Promise resolving to an HTTP response
 */
const loginUser = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password } = req.body;

        // No email or password given
        if (!email || !password) {
            return res.sendStatus(400);
        }

        const user = await getUserUsingEmail(email).select('+authentication.salt +authentication.password');

        // Unauthorized if user not found
        if (!user) {
            return res.sendStatus(401);
        }

        const hashedPassword = hashPassword(user.authentication.salt, password);

        // Unauthorized if passwords don't match
        if (user.authentication.password !== hashedPassword) {
            return res.sendStatus(401);
        }

        // Generate session token and assign to user
        const sessionToken = generateRandomString(); 
        user.authentication.sessionToken = sessionToken;
        await user.save();

        res.cookie('MADHU-AUTH', sessionToken, { domain: 'localhost', path: '/' });

        // Return logged-in user
        return res.status(200).json(user).end();
    } catch (error) {
        // Internal server error
        console.error(error);
        return res.sendStatus(500);
    }
}

export { registerUser, loginUser };