import request from "supertest";
import { CommentTest } from "../src/interfaces/Comment";
import { token } from "morgan";

const getComments = (url: string | Function): Promise<CommentTest[]> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post("/graphql")
      .set("Content-type", "application/json")
      .send({
        query: `query Comments {
            comments {
              id
              text
              owner {
                id
              }
              post {
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
          console.log(response.body);
          const comments = response.body.data.comments;
          expect(comments).toBeInstanceOf(Array);
          expect(comments[0]).toHaveProperty("id");
          expect(comments[0]).toHaveProperty("text");
          expect(comments[0]).toHaveProperty("owner");
          expect(comments[0]).toHaveProperty("post");
          expect(comments[0]).toHaveProperty("createdAt");
          resolve(response.body.data.comments);
        }
      });
  });
};

const getSingleComment = (
  url: string | Function,
  id: string
): Promise<CommentTest> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post("/graphql")
      .set("Content-type", "application/json")
      .send({
        query: `query CommentById($commentByIdId: ID!) {
            commentById(id: $commentByIdId) {
              id
              text
              owner {
                id
              }
              post {
                id
              }
              createdAt
            }
          }`,
        variables: {
          commentByIdId: id,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const comment = response.body.data.commentById;
          expect(comment).toHaveProperty("id");
          expect(comment).toHaveProperty("text");
          expect(comment).toHaveProperty("owner");
          expect(comment).toHaveProperty("post");
          expect(comment).toHaveProperty("createdAt");
          resolve(response.body.data.comment);
        }
      });
  });
};

const createComment = (
  url: string | Function,
  comment: CommentTest,
  token: string
): Promise<CommentTest> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post("/graphql")
      .set("Content-type", "application/json")
      .set("Authorization", "Bearer " + token)
      .send({
        query: `mutation CreateComment($text: String!, $owner: ID!, $post: ID!) {
            createComment(text: $text, owner: $owner, post: $post) {
              id
              text
              owner {
                id
              }
              post {
                id
              }
              createdAt
            }
          }`,
        variables: {
          ...comment,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const comment = response.body.data.createComment;
          expect(comment).toHaveProperty("id");
          expect(comment).toHaveProperty("text");
          expect(comment).toHaveProperty("owner");
          expect(comment).toHaveProperty("post");
          expect(comment).toHaveProperty("createdAt");
          resolve(comment);
        }
      });
  });
};

const updateComment = (
  url: string | Function,
  comment: CommentTest,
  token: string,
  id: string
): Promise<CommentTest> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post("/graphql")
      .set("Content-type", "application/json")
      .set("Authorization", "Bearer " + token)
      .send({
        query: `mutation UpdateComment($updateCommentId: ID!, $text: String!) {
            updateComment(id: $updateCommentId, text: $text) {
              id
              text
              owner {
                id
              }
              post {
                id
              }
              createdAt
            }
          }`,
        variables: {
          ...comment,
          updateCommentId: id,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const comment = response.body.data.updateComment;
          expect(comment).toHaveProperty("id");
          expect(comment).toHaveProperty("text");
          expect(comment).toHaveProperty("owner");
          expect(comment).toHaveProperty("post");
          expect(comment).toHaveProperty("createdAt");
          resolve(response.body.data.updateComment);
        }
      });
  });
};

const deleteComment = (
  url: string | Function,
  token: string,
  id: string
): Promise<CommentTest> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post("/graphql")
      .set("Content-type", "application/json")
      .set("Authorization", "Bearer " + token)
      .send({
        query: `mutation DeleteComment($deleteCommentId: ID!) {
            deleteComment(id: $deleteCommentId) {
              id
            }
          }`,
        variables: {
          deleteCommentId: id,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const comment = response.body.data.deleteComment;
          expect(comment).toHaveProperty("id");
          resolve(response.body.data.deleteComment);
        }
      });
  });
};

const wrongUserUpdateComment = (
  url: string | Function,
  comment: CommentTest,
  token: string,
  id: string
): Promise<CommentTest> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post("/graphql")
      .set("Content-type", "application/json")
      .set("Authorization", "Bearer " + token)
      .send({
        query: `mutation UpdateComment($updateCommentId: ID!, $text: String!) {
            updateComment(id: $updateCommentId, text: $text) {
              id
              text
              owner {
                id
              }
              post {
                id
              }
              createdAt
            }
          }`,
        variables: {
          ...comment,
          updateCommentId: id,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const comment = response.body.data;
          expect(comment).toBe(null);
          resolve(response.body.data);
        }
      });
  });
};

const wrongUserDeleteComment = (
  url: string | Function,
  token: string,
  id: string
): Promise<CommentTest> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post("/graphql")
      .set("Content-type", "application/json")
      .set("Authorization", "Bearer " + token)
      .send({
        query: `mutation DeleteComment($deleteCommentId: ID!) {
            deleteComment(id: $deleteCommentId) {
              id
            }
          }`,
        variables: {
          deleteCommentId: id,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const comment = response.body.data;
          expect(comment).toBe(null);
          resolve(comment);
        }
      });
  });
};

export {
  getComments,
  getSingleComment,
  createComment,
  updateComment,
  deleteComment,
  wrongUserUpdateComment,
  wrongUserDeleteComment,
};
