import request from "supertest";
import { PostTest } from "../src/interfaces/Post";
import UploadMessageResponse from "../src/interfaces/responses/UploadMessageResponse";

const getPost = (url: string | Function): Promise<PostTest[]> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post("/graphql")
      .set("Content-type", "application/json")
      .send({
        query: `query Posts {
            posts {
              id
              status
              title
              description
              likes {
                id
              }
              comments {
                id
              }
              owner {
                id
              }
              createdAt
              filename
            }
          }`,
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const posts = response.body.data.posts;
          console.log(response.body);
          expect(posts).toBeInstanceOf(Array);
          expect(posts[0]).toHaveProperty("id");
          expect(posts[0]).toHaveProperty("status");
          expect(posts[0]).toHaveProperty("title");
          expect(posts[0]).toHaveProperty("description");
          expect(posts[0]).toHaveProperty("likes");
          expect(posts[0]).toHaveProperty("comments");
          expect(posts[0]).toHaveProperty("owner");
          expect(posts[0]).toHaveProperty("createdAt");
          expect(posts[0]).toHaveProperty("filename");
          resolve(response.body.data.posts);
        }
      });
  });
};

const postFile = (
  url: string | Function,
  token: string
): Promise<UploadMessageResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post("/api/v1/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("bird", "test/IMG_0454.JPG")
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const uploadMessageResponse = response.body;
          expect(uploadMessageResponse).toHaveProperty("message");
          expect(uploadMessageResponse).toHaveProperty("data");
          expect(uploadMessageResponse.data).toHaveProperty("filename");
          resolve(uploadMessageResponse);
        }
      });
  });
};

const postPost = (
  url: string | Function,
  post: PostTest,
  token: string
): Promise<PostTest> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post("/graphql")
      .set("Content-type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `mutation CreatePost($owner: ID!, $filename: String!, $description: String) {
            createPost(owner: $owner, filename: $filename, description: $description) {
              id
              status
              title
              description
              owner {
                id
              }
              createdAt
              filename
            }
          }`,
        variables: {
          owner: post.owner,
          filename: post.filename,
          description: post.description,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const post = response.body.data.createPost;
          expect(post).toHaveProperty("id");
          expect(post).toHaveProperty("status");
          expect(post).toHaveProperty("title");
          expect(post).toHaveProperty("description");
          expect(post).toHaveProperty("owner");
          expect(post.owner).toHaveProperty("id");
          expect(post).toHaveProperty("createdAt");
          expect(post).toHaveProperty("filename");
          resolve(post);
        }
      });
  });
};

export { getPost, postFile, postPost };
