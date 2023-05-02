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
          expect(posts).toBeInstanceOf(Array);
          expect(posts[0]).toHaveProperty("id");
          expect(posts[0]).toHaveProperty("status");
          expect(posts[0]).toHaveProperty("title");
          expect(posts[0]).toHaveProperty("description");
          expect(posts[0]).toHaveProperty("likes");
          expect(posts[0]).toHaveProperty("owner");
          expect(posts[0]).toHaveProperty("createdAt");
          expect(posts[0]).toHaveProperty("filename");
          resolve(response.body.data.posts);
        }
      });
  });
};

const getSinglePost = (
  url: string | Function,
  id: string
): Promise<PostTest> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post("/graphql")
      .set("Content-type", "application/json")
      .send({
        query: `query PostById($postByIdId: ID!) {
          postById(id: $postByIdId) {
            id
            status
            title
            description
            likes {
              id
            }
            owner {
              id
            }
            createdAt
            filename
          }
        }`,
        variables: {
          postByIdId: id,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const post = response.body.data.postById;
          expect(post).toHaveProperty("id");
          expect(post).toHaveProperty("status");
          expect(post).toHaveProperty("title");
          expect(post).toHaveProperty("description");
          expect(post).toHaveProperty("likes");
          expect(post).toHaveProperty("owner");
          expect(post.owner).toHaveProperty("id");
          expect(post).toHaveProperty("createdAt");
          expect(post).toHaveProperty("filename");
          resolve(response.body.data.post);
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

const getPostByOwner = (
  url: string | Function,
  id: string
): Promise<PostTest[]> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post("/graphql")
      .set("Content-type", "application/json")
      .send({
        query: `query PostByOwner($userId: ID!) {
          postByOwner(userId: $userId) {
            id
            status
            title
            description
            likes {
              id
            }
            owner {
              id
            }
            createdAt
            filename
          }
        }`,
        variables: {
          userId: id,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const posts = response.body.data.postByOwner;
          expect(posts).toBeInstanceOf(Array);
          expect(posts[0]).toHaveProperty("id");
          expect(posts[0]).toHaveProperty("status");
          expect(posts[0]).toHaveProperty("title");
          expect(posts[0]).toHaveProperty("description");
          expect(posts[0]).toHaveProperty("likes");
          expect(posts[0]).toHaveProperty("owner");
          expect(posts[0]).toHaveProperty("createdAt");
          expect(posts[0]).toHaveProperty("filename");
          resolve(response.body.data.postsByOwner);
        }
      });
  });
};

const userPutPost = (
  url: string | Function,
  post: PostTest,
  token: string,
  id: string
): Promise<PostTest> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post(`/graphql`)
      .set("Content-type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `mutation UpdatePost($updatePostId: ID!, $status: Boolean!, $title: String, $description: String) {
          updatePost(id: $updatePostId, status: $status, title: $title, description: $description) {
            id
            status
            title
            description
            likes {
              id
            }
            owner {
              id
            }
            createdAt
            filename
          }
        }`,
        variables: {
          ...post,
          updatePostId: id,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const updatedPost = response.body.data.updatePost;
          expect(updatedPost).toHaveProperty("status");
          expect(updatedPost).toHaveProperty("title");
          expect(updatedPost).toHaveProperty("description");
          expect(updatedPost.status).toBe(post.status);
          expect(updatedPost.title).toBe(post.title);
          expect(updatedPost.title).not.toBe("Unknown");
          expect(updatedPost.description).toBe(post.description);
          resolve(updatedPost);
        }
      });
  });
};

const wrongUserPutPost = (
  url: string | Function,
  post: PostTest,
  token: string,
  id: string
): Promise<PostTest> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post(`/graphql`)
      .set("Content-type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `mutation UpdatePost($updatePostId: ID!, $status: Boolean!, $title: String, $description: String) {
          updatePost(id: $updatePostId, status: $status, title: $title, description: $description) {
            id
            status
            title
            description
            likes {
              id
            }
            owner {
              id
            }
            createdAt
            filename
          }
        }`,
        variables: {
          ...post,
          updatePostId: id,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const updatedPost = response.body.data;
          expect(updatedPost).toBe(null);
          resolve(updatedPost);
        }
      });
  });
};
// delete post
const deletePost = (
  url: string | Function,
  token: string,
  id: string
): Promise<PostTest> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post(`/graphql`)
      .set("Content-type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `mutation DeletePost($deletePostId: ID!) {
          deletePost(id: $deletePostId) {
            id
          }
        }`,
        variables: {
          deletePostId: id,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const deletedPost = response.body.data.deletePost;
          expect(deletedPost).toHaveProperty("id");
          resolve(deletedPost);
        }
      });
  });
};

const wrongUserDeletePost = (
  url: string | Function,
  token: string,
  id: string
): Promise<PostTest> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post(`/graphql`)
      .set("Content-type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `mutation DeletePost($deletePostId: ID!) {
          deletePost(id: $deletePostId) {
            id
          }
        }`,
        variables: {
          deletePostId: id,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const deletedPost = response.body.data;
          expect(deletedPost).toBe(null);
          resolve(deletedPost);
        }
      });
  });
};

export {
  getPost,
  getSinglePost,
  postFile,
  postPost,
  getPostByOwner,
  userPutPost,
  wrongUserPutPost,
  deletePost,
  wrongUserDeletePost,
};
