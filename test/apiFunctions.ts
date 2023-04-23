import request from "supertest";
import { UserTest } from "../src/interfaces/User";

const getNotFound = (url: string | Function) => {
  return new Promise((resolve, reject) => {
    request(url)
      .get("/what-is-this")
      .expect(404, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response.body);
        }
      });
  });
};

const loginBrute = (
  url: string | Function,
  user: UserTest
): Promise<boolean> => {
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
          if (
            response.body.errors?.[0]?.message ===
            "You are trying to access 'login' too often"
          ) {
            console.log("brute blocked", response.body.errors[0].message);
            resolve(true);
          } else {
            resolve(false);
          }
        }
      });
  });
};
export { getNotFound, loginBrute };
