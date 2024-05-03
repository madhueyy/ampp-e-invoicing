import request from 'supertest';
import app from '../../src/server';
import { closeServer }  from '../../src/server';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

interface UserData {
    email: string;
    password: string;
}

interface File {
    format: string,
    data: [Object],
    _id: string;
}

describe('Invoice Rendering API - Render to JSON', () => {
    let userData: UserData;
    let token: string;

    beforeAll(async () => {
        // Initialize userData
        userData = {
            email: 'ihateseng2021@gmail.com',
            password: 'password123',
        };

        const resp = await request(app)
            .post('/auth/login')
            .send(userData);
        
        token = resp.body.authentication.sessionToken;
    });

    test('Correctly gets the list of the users rendered invoices', async () => {
        const user = { 
            _id: '661df2c65f005c1adac40040'
        };

        // Make a request with authenticated user
        const response = await request(app)
            .get('/api/invoices')
            .set('Authorization', `Bearer ${token}`)

        expect(response.status).toBe(200);
        response.body.forEach((file: File) => expect(file._id).toEqual(user._id));
    });

    test('Correctly gets a specific invoice', async () => {
        const user = { 
            _id: '661df2c65f005c1adac40040'
        };

        // Make a request with authenticated user
        const response = await request(app)
            .get('/api/view-invoice?id=661df2c65f005c1adac40040')
            .set('Authorization', `Bearer ${token}`)

        expect(response.status).toBe(200);
        expect(response.body._id).toEqual(user._id);
    });

    // Closing the mongoDB connection
    afterAll(async () => {
        await mongoose.connection.close();
        closeServer();
    });
});