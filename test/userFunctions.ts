import request from "supertest";
import { UserTest } from "../src/interfaces/User";
import LoginMessageResponse from "../src/interfaces/responses/LoginMessageResponse";
import randomstring from "randomstring";
import ErrorResponse from "../src/interfaces/responses/ErrorResponse";

const getUser = (url: string | Function): Promise<UserTest[]> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post("/graphql")
      .set("Content-type", "application/json")
      .send({
        query: `{
          users {
            id
            email
            username
            likes {
              id
            }
            posts {
              id
            }
            comments {
              id
            }
            createdAt
          }
        }`,
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const users = response.body.data.users;
          expect(users).toBeInstanceOf(Array);
          expect(users[0]).toHaveProperty("id");
          expect(users[0]).toHaveProperty("username");
          expect(users[0]).toHaveProperty("email");
          expect(users[0]).toHaveProperty("likes");
          expect(users[0]).toHaveProperty("comments");
          expect(users[0]).toHaveProperty("posts");
          expect(users[0]).toHaveProperty("createdAt");
          resolve(response.body.data.users);
        }
      });
  });
};

const postUser = (
  url: string | Function,
  user: UserTest
): Promise<UserTest> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post("/graphql")
      .set("Content-type", "application/json")
      .send({
        query: `mutation Register($user: UserInput!) {
          register(user: $user) {
            message
            user {
              id
              email
              username
            }
          }
        }`,
        variables: {
          user: {
            username: user.username,
            email: user.email,
            password: user.password,
          },
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const userData = response.body.data.register;
          expect(userData).toHaveProperty("message");
          expect(userData).toHaveProperty("user");
          expect(userData.user).toHaveProperty("id");
          expect(userData.user.username).toBe(user.username);
          expect(userData.user.email).toBe(user.email);
          resolve(response.body.data.register);
        }
      });
  });
};
const loginUser = (
  url: string | Function,
  user: UserTest
): Promise<LoginMessageResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post("/graphql")
      .set("Content-type", "application/json")
      .send({
        query: `mutation Login($credentials: Credentials!) {
          login(credentials: $credentials) {
            message
            token
            user {
              id
              email
              username
            }
          }
        }`,
        variables: {
          credentials: {
            username: user.username,
            password: user.password,
          },
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const userData = response.body.data.login;
          expect(userData).toHaveProperty("message");
          expect(userData).toHaveProperty("token");
          expect(userData).toHaveProperty("user");
          expect(userData.user).toHaveProperty("id");
          expect(userData.user.email).toBe(user.email);
          expect(userData.user.username).toBe(user.username);
          resolve(response.body.data.login);
        }
      });
  });
};

const getSingleUser = (
  url: string | Function,
  id: string
): Promise<UserTest> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post("/graphql")
      .set("Content-type", "application/json")
      .send({
        query: `query UserById($userByIdId: ID!) {
          userById(id: $userByIdId) {
            id
            email
            username
            createdAt
            comments {
              id
            }
            likes {
              id
            }
            posts {
              id
            }
          }
        }`,
        variables: {
          userByIdId: id,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const user = response.body.data.userById;
          expect(user.id).toBe(id);
          expect(user).toHaveProperty("username");
          expect(user).toHaveProperty("email");
          expect(user).toHaveProperty("createdAt");
          expect(user).toHaveProperty("comments");
          expect(user).toHaveProperty("likes");
          expect(user).toHaveProperty("posts");
          resolve(response.body.data.userById);
        }
      });
  });
};
const putUser = (url: string | Function, token: string) => {
  return new Promise((resolve, reject) => {
    const newValue = "Update Test " + randomstring.generate(7);
    request(url)
      .post("/graphql")
      .set("Content-type", "application/json")
      .set("Authorization", "Bearer " + token)
      .send({
        query: `mutation UpdateUser($user: UserModify!) {
          updateUser(user: $user) {
            message
            user {
              email
              username
              id
            }
          }
        }`,
        variables: {
          user: {
            username: newValue,
          },
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const userData = response.body.data.updateUser;
          expect(userData).toHaveProperty("message");
          expect(userData).toHaveProperty("user");
          expect(userData.user).toHaveProperty("id");
          expect(userData.user).toHaveProperty("email");
          expect(userData.user).toHaveProperty("username");
          expect(userData.user.username).toBe(newValue);
          resolve(response.body.data.updateUser);
        }
      });
  });
};
const deleteUser = (
  url: string | Function,
  token: string
): Promise<ErrorResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post("/graphql")
      .set("Authorization", "Bearer " + token)
      .send({
        query: `mutation DeleteUser {
          deleteUser {
            message
            user {
              id
              username
              email
            }
          }
        }`,
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const userData = response.body.data.deleteUser;
          expect(userData).toHaveProperty("message");
          expect(userData).toHaveProperty("user");
          expect(userData.user).toHaveProperty("id");
          expect(userData.user).toHaveProperty("username");
          expect(userData.user).toHaveProperty("email");
          resolve(response.body.data.deleteUser);
        }
      });
  });
};

const adminDeleteUser = (
  url: string | Function,
  id: string,
  token: string
): Promise<ErrorResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post("/graphql")
      .set("Authorization", "Bearer " + token)
      .send({
        query: `mutation DeleteUserAsAdmin($deleteUserAsAdminId: ID!) {
          deleteUserAsAdmin(id: $deleteUserAsAdminId) {
            message
            user {
              username
              id
              email
            }
          }
        }`,
        variables: {
          deleteUserAsAdminId: id,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const userData = response.body.data.deleteUserAsAdmin;
          expect(userData).toHaveProperty("message");
          expect(userData).toHaveProperty("user");
          expect(userData.user).toHaveProperty("id");
          expect(userData.user).toHaveProperty("username");
          expect(userData.user).toHaveProperty("email");
          expect(userData.user.id).toBe(id);
          resolve(response.body.data.deleteUser);
        }
      });
  });
};

const wrongUserDeleteUser = (
  url: string | Function,
  id: string,
  token: string
): Promise<ErrorResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post("/graphql")
      .set("Authorization", "Bearer " + token)
      .send({
        query: `mutation DeleteUserAsAdmin($deleteUserAsAdminId: ID!) {
          deleteUserAsAdmin(id: $deleteUserAsAdminId) {
            message
            user {
              username
              id
              email
            }
          }
        }`,
        variables: {
          deleteUserAsAdminId: id,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const userData = response.body.data.deleteUserAsAdmin;
          expect(userData).toBe(null);
          resolve(response.body.data.deleteUser);
        }
      });
  });
};

export {
  getUser,
  postUser,
  loginUser,
  getSingleUser,
  putUser,
  deleteUser,
  adminDeleteUser,
  wrongUserDeleteUser,
};
