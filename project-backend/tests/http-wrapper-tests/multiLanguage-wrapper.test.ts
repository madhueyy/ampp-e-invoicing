import translateFunction from '../../src/services/multiLanguage';
import request from 'supertest';
import app from '../../src/server';
import { closeServer } from '../../src/server';
import { convertToHTML } from '../../src/services/xmlConverter';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

describe('Invoice Rendering API - Multi-Language Invoices', () => {
    let userData: UserData;
    let token: string;

    beforeAll(async () => {
        // Initialize userData
        userData = {
            email: 'madhu.iscool5454@gmail.com',
            password: 'password123',
        };

        const resp = await request(app)
            .post('/auth/login')
            .send(userData);
        
        token = resp.body.authentication.sessionToken;
    });

    test('Renders a Chinese translated HTML file correctly', async () => {
        const xmlFilePath = path.join(__dirname, '../resources/example1.xml');

        const response = await request(app)
            .post('/upload-xml/html?translate=true')
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'multipart/form-data')
            .attach('xmlFile', xmlFilePath);

        const xmlFile = fs.readFileSync(xmlFilePath, 'utf-8');
        const translatedHTML = await convertToHTML(xmlFile, true);

        expect(response.status).toBe(200);
        expect(response.text).toStrictEqual(translatedHTML);
    },100000);

    // Closing the mongoDB connection
    afterAll(async () => {
        await mongoose.connection.close();
        closeServer();
    });
});

interface UserData {
    email: string;
    password: string;
}
