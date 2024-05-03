import request from 'supertest';
import app from '../../src/server';
import { closeServer }  from '../../src/server';
import { convertToHTML } from '../../src/services/xmlConverter';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

describe('Invoice Rendering API - Render to html', () => {
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

    test('Renders UBL XML file to HTML correctly', async () => {
        const xmlFilePath = path.join(__dirname, '../resources/example1.xml');
        const response = await request(app)
            .post('/upload-xml/html')
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'multipart/form-data')
            .attach('xmlFile', xmlFilePath);

        const xmlFile = fs.readFileSync(xmlFilePath, 'utf-8');
        const convertedHTML = await convertToHTML(xmlFile, false);

        expect(response.status).toBe(200);
        expect(response.text).toStrictEqual(convertedHTML);
    });

    test('Nothing in file provided', async () => {
        const xmlFilePath = path.join(__dirname, '../resources/thisDoesntExist.xml');
        // Creates an empty file
        fs.writeFileSync(xmlFilePath, '');

        const response = await request(app)
            .post('/upload-xml/html')
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'multipart/form-data')
            .attach('xmlFile', xmlFilePath);
        
        // Delete the temporary file after the test
        fs.unlinkSync(xmlFilePath);

        expect(response.status).toBe(422);
        expect(response.body.error).toStrictEqual('File does not contain any content');
    });

    test.skip('Invalid ubl xml format provided in file', async () => {
        // Not sure if we need to do this as validation is handled in another API
        const xmlFilePath = path.join(__dirname, '../resources/Invalid.xml');

        const response = await request(app)
            .post('/upload-xml/html')
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'multipart/form-data')
            .attach('xmlFile', xmlFilePath);
        
        expect(response.status).toBe(422);
        expect(response.body.error).toStrictEqual('File is in an invalid format. Must follow UBL XML standards.');
    });

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
