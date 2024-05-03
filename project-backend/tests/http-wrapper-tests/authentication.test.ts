import request from 'supertest';
import app from '../../src/server';
import { closeServer }  from '../../src/server';
import { deleteUserUsingEmail } from '../../src/db/users';
import mongoose from 'mongoose';

describe('Authentication API - Register', () => {
    let userData: UserData;

    beforeAll(() => {
        // Initialize userData
        userData = {
            email: 'test2@example.com',
            password: 'testpassword',
            username: 'testuser2'
        };
    });

    // test one: registering a user
    test('Register User', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send(userData);

        expect(response.status).toBe(200);
        expect(response.body.email).toBe(userData.email);
        expect(response.body.username).toBe(userData.username);
        expect(response.body.authentication).toBeDefined();
    });

     // test two: user logging in
     test('Login User', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ email: userData.email, password: userData.password });

        expect(response.status).toBe(200);
        expect(response.body.authentication).toBeDefined();
    });

    // test three: user logging in with the wrong password
    test('Login with Wrong Password', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ email: userData.email, password: 'wrongpassword' });

        expect(response.status).toBe(401);
    });

    // test four: user loggin in with the wrong email
    test('Login with Wrong Email', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'wrongemail@example.com', password: userData.password });

        expect(response.status).toBe(401);
    });

    // test five: user logging in with the wrong email and password
    test('Login with Wrong Email and Password', async () => {
        // defining wrong user data
        const wrongUserEmail = {
            email: 'wrongemail@example.com',
            password: 'wrongpassword'
        };

        const response = await request(app)
            .post('/auth/login')
            .send(wrongUserEmail);

        expect(response.status).toBe(401);
    });

    // test six: user registering with a email that has already been taken
    test('Registering with a taken email', async () => {
        const takenUserEmail = {
            email: 'test2@example.com',
            password: 'password',
            username: 'username'
        };

        const response = await request(app)
            .post('/auth/register')
            .send(takenUserEmail);

        expect(response.status).toBe(400);
    });

    // test seven: user registerting with a username that has already been taken
    test('Registering with a taken username', async () => {
        const takenUsername = {
            email: 'newuser@example.com',
            password: 'password',
            username: 'username'
        };

        const response = await request(app)
            .post('/auth/register')
            .send(takenUsername);

        expect(response.status).toBe(400);
    });

    // test eight : user enters an empty string for their email and password
    test('Empty string entered for email and password', async () => {
        const response = await request(app)
          .post('/auth/register')
          .send({
            email: '',
            username: 'testUser',
            password: ''
          });

        expect(response.status).toBe(400);
    });

    // User enters no request body
    test('Empty string entered for email and password', async () => {
        const response = await request(app)
          .post('/auth/login')
          .send({
            email: '',
            password: ''
          });

        expect(response.status).toBe(400);
    });

    afterAll(async () => {
        // Delete the user created during the test
        await deleteUserUsingEmail (userData.email);
        await mongoose.connection.close();
        closeServer();
    });
});


interface UserData {
    email: string;
    password: string;
    username: string;
}