import app from '../src/app';
import mongoose from "mongoose";
import LoginMessageResponse from "../src/interfaces/responses/LoginMessageResponse";
import { UserTest } from "../src/interfaces/User";
import randomstring from "randomstring";
import { getNotFound } from "./apiFunctions";
import { Express } from 'express-serve-static-core';
import { getUser, loginUser, postUser } from './userFunctions';
import jwt from 'jsonwebtoken';

describe('Testing graphql api', () => {
    // Connect to database
    beforeAll(async () => {
        console.log("DATABASE_URL", process.env.DATABASE_URL);
      await mongoose.connect(process.env.DATABASE_URL as string);
    });
    // Disconnect from database
    afterAll(async () => {
      await mongoose.connection.close();
    });
    // test not found
    it('responds with a not found message', async () => {
        await getNotFound(app);
    });
    // User data
    let userData: LoginMessageResponse;
    let userData2: LoginMessageResponse;
    let adminData: LoginMessageResponse;

    // Create test users
    const testUser: UserTest = {
    username: 'Test User ' + randomstring.generate(7),
    email: randomstring.generate(9) + '@user.fi',
    password: 'testpassword',
    };

    const testUser2: UserTest = {
    username: 'Test User ' + randomstring.generate(7),
    email: randomstring.generate(9) + '@user.fi',
    password: 'testpassword',
    };
    // Test admin user
    const adminUser: UserTest = {
    email: 'admin@metropolia.fi',
    username: 'admin',
    password: '12345',
    };
    
    // create first user
    it('should create a new user', async () => {
        await postUser(app, testUser);
    });

    // create second user to try to modify someone else's post, comment and userdata
    it('should create second user', async () => {
        await postUser(app, testUser2);
    });

    // test login
    it('should login user', async () => {
        userData = await loginUser(app, testUser);
    });

    // test login with second user
    it('should login second user', async () => {
        userData2 = await loginUser(app, testUser2);
    });

    // test login with admin
    it('should login admin', async () => {
        adminData = await loginUser(app, adminUser);
    });

    // make sure token has role (so that we can test if user is admin or not)
    it('token should have role', async () => {
        const dataFromToken = jwt.verify(
        userData.token!,
        process.env.JWT_SECRET as string
        );
        expect(dataFromToken).toHaveProperty('role');
    });

    // test get all users
    it('should return array of users', async () => {
        await getUser(app);
    });

    // test get single user
    it('should return single user', async () => {
        await getSingleUser(app, userData.user.id!);
    });

    // test update user
    it('should update user', async () => {
        await putUser(app, userData.token!);
    });
});


function getSingleUser(app: Express, arg1: string) {
    throw new Error('Function not implemented.');
}


function putUser(app: Express, arg1: string) {
    throw new Error('Function not implemented.');
}
