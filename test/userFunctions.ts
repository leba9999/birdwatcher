import request from 'supertest';
import { UserTest } from '../src/interfaces/User';
import LoginMessageResponse from '../src/interfaces/responses/LoginMessageResponse';

const getUser = (url: string | Function): Promise<UserTest[]> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/graphql')
      .set('Content-type', 'application/json')
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
        //console.log("Here!!!!!!!!!!" , response)
        if (err) {
          reject(err);
        } else {
          const users = response.body.data.users;
          expect(users).toBeInstanceOf(Array);
          expect(users[0]).toHaveProperty('id');
          expect(users[0]).toHaveProperty('username');
          expect(users[0]).toHaveProperty('email');
          expect(users[0]).toHaveProperty('likes');
          expect(users[0]).toHaveProperty('comments');
          expect(users[0]).toHaveProperty('posts');
          expect(users[0]).toHaveProperty('createdAt');
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
      .post('/graphql')
      .set('Content-type', 'application/json')
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
          expect(userData).toHaveProperty('message');
          expect(userData).toHaveProperty('user');
          expect(userData.user).toHaveProperty('id');
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
      .post('/graphql')
      .set('Content-type', 'application/json')
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
          console.log('login response', response.body);
          const userData = response.body.data.login;
          expect(userData).toHaveProperty('message');
          expect(userData).toHaveProperty('token');
          expect(userData).toHaveProperty('user');
          expect(userData.user).toHaveProperty('id');
          expect(userData.user.email).toBe(user.email);
          expect(userData.user.username).toBe(user.username);
          resolve(response.body.data.login);
        }
      });
  });
};

export {getUser, postUser, loginUser};