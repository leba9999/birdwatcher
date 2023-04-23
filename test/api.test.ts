import app from "../src/app";
import mongoose from "mongoose";
import LoginMessageResponse from "../src/interfaces/responses/LoginMessageResponse";
import { UserTest } from "../src/interfaces/User";
import randomstring from "randomstring";
import {
  adminDeleteUser,
  adminPutAsAdmin,
  deleteUser,
  getSingleUser,
  getUser,
  loginUser,
  postUser,
  putUser,
  wrongUserDeleteUser,
} from "./userFunctions";
import jwt from "jsonwebtoken";
import { getNotFound, loginBrute } from "./apiFunctions";

describe("Testing user interactions in graphql api", () => {
  // Connect to database
  beforeAll(async () => {
    await mongoose.connect(process.env.DATABASE_URL as string);
  });
  // Disconnect from database
  afterAll(async () => {
    await mongoose.connection.close();
  });
  // test not found
  it("responds with a not found message", async () => {
    await getNotFound(app);
  });
  // User data
  let userData: LoginMessageResponse;
  let userData2: LoginMessageResponse;
  let adminData: LoginMessageResponse;

  // Create test users
  const testUser: UserTest = {
    username: "Test User " + randomstring.generate(7),
    email: randomstring.generate(9) + "@user.fi",
    password: "testpassword",
  };

  const testUser2: UserTest = {
    username: "Test User " + randomstring.generate(7),
    email: randomstring.generate(9) + "@user.fi",
    password: "testpassword",
  };
  // Test admin user
  const adminUser: UserTest = {
    email: "admin@metropolia.fi",
    username: "admin",
    password: "12345",
  };

  // create first user
  it("should create a new user", async () => {
    await postUser(app, testUser);
  });

  // create second user to try to modify someone else's post, comment and userdata
  it("should create second user", async () => {
    await postUser(app, testUser2);
  });

  // test login
  it("should login user", async () => {
    userData = await loginUser(app, testUser);
  });

  // test login with second user
  it("should login second user", async () => {
    userData2 = await loginUser(app, testUser2);
  });

  // test login with admin
  it("should login admin", async () => {
    adminData = await loginUser(app, adminUser);
  });

  // make sure token has role (so that we can test if user is admin or not)
  it("token should have role", async () => {
    const dataFromToken = jwt.verify(
      userData.token!,
      process.env.JWT_SECRET as string
    );
    expect(dataFromToken).toHaveProperty("role");
  });

  // test get all users
  it("should return array of users", async () => {
    await getUser(app);
  });

  // test get single user
  it("should return single user", async () => {
    await getSingleUser(app, userData.user.id!);
  });

  // test update user
  it("should update user", async () => {
    await putUser(app, userData.token!);
  });

  // test update admin as admin
  it("should update admin", async () => {
    await adminPutAsAdmin(app, adminData.token!);
  });

  // test delete other user by id as user
  it("should not delete other user as user", async () => {
    await wrongUserDeleteUser(app, userData2.user.id!, userData.token!);
  });

  // test delete user by id as admin
  it("should delete a user as admin", async () => {
    await adminDeleteUser(app, userData2.user.id!, adminData.token!);
  });

  // test delete user based on token
  it("should delete current user", async () => {
    await deleteUser(app, userData.token!);
  });
  // test brute force protectiom
  test("Brute force attack simulation", async () => {
    const maxAttempts = 20;
    const mockUser: UserTest = {
      username: "Test User " + randomstring.generate(7),
      email: randomstring.generate(9) + "@user.fi",
      password: "notthepassword",
    };

    try {
      // Call the mock login function until the maximum number of attempts is reached
      for (let i = 0; i < maxAttempts; i++) {
        const result = await loginBrute(app, mockUser);
        if (result) throw new Error("Brute force attack unsuccessful");
      }

      // If the while loop completes successfully, the test fails
      throw new Error("Brute force attack succeeded");
    } catch (error) {
      console.log(error);
      // If the login function throws an error, the test passes
      expect((error as Error).message).toBe("Brute force attack unsuccessful");
    }
  }, 15000);
});
