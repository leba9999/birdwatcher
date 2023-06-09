import app from "../src/app";
import mongoose from "mongoose";
import LoginMessageResponse from "../src/interfaces/responses/LoginMessageResponse";
import UploadMessageResponse from "../src/interfaces/responses/UploadMessageResponse";
import { UserTest } from "../src/interfaces/User";
import randomstring from "randomstring";
import { Types } from "mongoose";
import {
  adminDeleteUser,
  deleteUser,
  getSingleUser,
  getUser,
  loginUser,
  postUser,
  putUser,
  wrongUserDeleteUser,
} from "./userFunctions";
import jwt from "jsonwebtoken";
import { getNotFound, loginBrute, loginBruteExpress } from "./apiFunctions";
import { PostTest } from "../src/interfaces/Post";
import {
  deletePost,
  getPost,
  getPostByOwner,
  getSinglePost,
  postFile,
  postPost,
  userPutPost,
  wrongUserDeletePost,
  wrongUserPutPost,
} from "./postFunctions";
import {
  createComment,
  deleteComment,
  getComments,
  getSingleComment,
  updateComment,
  wrongUserDeleteComment,
  wrongUserUpdateComment,
} from "./commentFunctions";
import { CommentTest } from "../src/interfaces/Comment";
import { Express } from "express-serve-static-core";

describe("Testing user interactions in graphql api", () => {
  // Connect to database
  beforeAll(async () => {
    console.log(process.env.DATABASE_URL);
    await mongoose.connect(process.env.DATABASE_URL as string);
  }, 10000);
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

  // test image upload
  let uploadData: UploadMessageResponse;
  let postData: PostTest;
  it("should upload a image", async () => {
    uploadData = await postFile(app, userData.token!);
    postData = {
      description: "Test description " + randomstring.generate(50),
      owner: userData.user.id! as unknown as Types.ObjectId,
      filename: uploadData.data.filename,
    };
  });

  // test post Post data
  let postID: string;
  it("should create post with data and file", async () => {
    const post = await postPost(app, postData, userData.token!);
    postID = post.id!;
  });

  // test get array of posts
  it("should return array of posts", async () => {
    await getPost(app);
  });

  // test get single post
  it("should return single post", async () => {
    await getSinglePost(app, postID);
  });

  // test get post by owner/user
  it("should return array of posts by owner", async () => {
    await getPostByOwner(app, userData.user.id!);
  });

  // test update post
  it("should update post", async () => {
    let updatedPostData: PostTest = {
      status: true,
      title: "Harmaasieppo",
      description: "Updated description " + randomstring.generate(50),
    };
    await userPutPost(app, updatedPostData, userData.token!, postID);
  });

  // test wrong user update post
  it("should not update post", async () => {
    let updatedPostData: PostTest = {
      status: true,
      title: "Not allowed to update",
      description: "Test description " + randomstring.generate(50),
    };
    await wrongUserPutPost(app, updatedPostData, userData2.token!, postID);
  });

  // test admin update post
  it("admin should update post", async () => {
    let updatedPostData: PostTest = {
      status: true,
      title: "Admin has edited this post",
      description: "Updated description " + randomstring.generate(50),
    };
    await userPutPost(app, updatedPostData, adminData.token!, postID);
  });

  let postID2: string;
  it("should create second post", async () => {
    const post = await postPost(app, postData, userData2.token!);
    postID2 = post.id!;
  });

  // test admin can delete others posts
  it("admin should delete post", async () => {
    await deletePost(app, adminData.token!, postID2);
  });

  let commentData: CommentTest;
  // test create comment
  it("should create comment", async () => {
    let comment = {
      text: "Test comment " + randomstring.generate(50),
      owner: userData2.user.id! as unknown as Types.ObjectId,
      post: postID as unknown as Types.ObjectId,
    };
    commentData = await createComment(app, comment, userData2.token!);
  });

  let commentData2: CommentTest;
  // test another create comment
  it("should create another comment", async () => {
    let comment = {
      text: "Test comment " + randomstring.generate(50),
      owner: userData.user.id! as unknown as Types.ObjectId,
      post: postID as unknown as Types.ObjectId,
    };
    commentData2 = await createComment(app, comment, userData.token!);
  });

  let commentData3: CommentTest;
  // test admin can create comment
  it("admin should create comment", async () => {
    let comment = {
      text: "Test comment " + randomstring.generate(50),
      owner: adminData.user.id! as unknown as Types.ObjectId,
      post: postID as unknown as Types.ObjectId,
    };
    commentData3 = await createComment(app, comment, adminData.token!);
  });

  // test get comments
  it("should return array of comments", async () => {
    await getComments(app);
  });

  // test get single comment
  it("should return single comment", async () => {
    await getSingleComment(app, commentData.id!);
  });

  // test update comment
  it("should update comment", async () => {
    let updatedCommentData: CommentTest = {
      text: "Updated comment " + randomstring.generate(50),
    };
    await updateComment(
      app,
      updatedCommentData,
      userData2.token!,
      commentData.id!
    );
  });

  // test wrong user update comment
  it("should not update comment as wrong user", async () => {
    let updatedCommentData: CommentTest = {
      text: "Should not update comment " + randomstring.generate(50),
    };
    await wrongUserUpdateComment(
      app,
      updatedCommentData,
      userData.token!,
      commentData.id!
    );
  });

  // test admin update comment
  it("admin should update own comment", async () => {
    let updatedCommentData: CommentTest = {
      text: "Admin has edited this comment " + randomstring.generate(50),
    };
    await updateComment(
      app,
      updatedCommentData,
      adminData.token!,
      commentData3.id!
    );
  });
  // test admin update comment
  it("admin should update others comment", async () => {
    let updatedCommentData: CommentTest = {
      text: "Admin has edited this comment " + randomstring.generate(50),
    };
    await updateComment(
      app,
      updatedCommentData,
      adminData.token!,
      commentData2.id!
    );
  });

  // test wrong user delete comment
  it("should not delete comment as wrong user", async () => {
    await wrongUserDeleteComment(app, userData.token!, commentData.id!);
  });

  // test delete comment
  it("should delete comment", async () => {
    await deleteComment(app, userData2.token!, commentData.id!);
  });

  // test admin delete comment
  it("admin should delete own comment", async () => {
    await deleteComment(app, adminData.token!, commentData3.id!);
  });
  // test admin delete comment
  it("admin should delete others comment", async () => {
    await deleteComment(app, adminData.token!, commentData2.id!);
  });

  // test wrong user delete post
  it("should not delete post as wrong user", async () => {
    await wrongUserDeletePost(app, userData2.token!, postID);
  });

  // test delete post
  it("should delete post", async () => {
    await deletePost(app, userData.token!, postID);
  });

  // test update user
  it("should update user", async () => {
    await putUser(app, userData.token!);
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
      // If the login function throws an error, the test passes
      expect((error as Error).message).toBe("Brute force attack unsuccessful");
    }
  }, 15000);
});
