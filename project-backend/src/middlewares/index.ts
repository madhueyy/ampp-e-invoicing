// This file will have helper functions to check
// if users are authenticated to do certain actions

import express from 'express';
import { get, merge } from 'lodash';

import { getUserUsingSessionToken } from '../db/users';

/**
 * Middleware to check if the current user is the owner of a resource
 * @param {express.Request} req - request object containing the resource ID in req.params and user identity in req.identity
 * @param {express.Response} res - response object to send HTTP responses
 * @param {express.NextFunction} next - next function to call in the middleware chain
 * @returns {Promise<void>} a Promise resolving to undefined
 */
// export const isOwner = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
//     try {
//         const { id } = req.params;
//         const currentUserId = get(req, 'identity._id') as string;

//         // Forbidden if not the owner
//         if (!currentUserId || currentUserId.toString() !== id) {
//             return res.sendStatus(403);
//         }

//         next();
//     } catch (error) {
//         console.error(error);
//         return res.sendStatus(500);
//     }
// }

/**
 * Middleware to check if a user is authenticated by verifying the session token
 * @param {express.Request} req - request object containing the session token in req.cookies
 * @param {express.Response} res - response object to send HTTP responses
 * @param {express.NextFunction} next - next function to call in the middleware chain
 * @returns {Promise<void>} a Promise resolving to undefined
 */
export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const authorizationHeader = req.headers['authorization'];

        // Unauthorized if session token is missing
        if (!authorizationHeader) {
            return res.sendStatus(401);
        }

        const sessionToken = authorizationHeader.replace('Bearer ', '');
        const existingUser = await getUserUsingSessionToken(sessionToken);

        // Unauthorized if user doesn't exist
        if (!existingUser) {
            return res.sendStatus(401);
        }

        req.user = existingUser;
        //merge(req, { identity: existingUser });

        return next();
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
}