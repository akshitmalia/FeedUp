require("dotenv").config({ path: "./.env" });

const request = require("supertest");
const mongoose = require("mongoose");
const express = require("express");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const feedRoutes = require("./routes/feedRoutes");
const User = require("./models/userschema");
const Feed = require("./models/postschema");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  req.io = { emit: () => {} };
  next();
});

app.use("/feedup", authRoutes);
app.use("/feedup", feedRoutes);

const TEST_DB_URI = process.env.TEST_MONGODB_URI;

let userACookie;
let userBCookie;
let userAId;

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
});

afterAll(async () => {
  await Feed.deleteMany({});
  await User.deleteMany({});
  await mongoose.disconnect();
});

beforeEach(async () => {
  await Feed.deleteMany({});
  await User.deleteMany({});

  const resA = await request(app)
    .post("/feedup/register")
    .send({ email: "userA@example.com", password: "password123" });
  userACookie = resA.headers["set-cookie"];

  const resB = await request(app)
    .post("/feedup/register")
    .send({ email: "userB@example.com", password: "password123" });
  userBCookie = resB.headers["set-cookie"];

  const userADoc = await User.findOne({ email: "userA@example.com" });
  userAId = userADoc._id.toString();
});

describe("POST /feedup/posts (create)", () => {
  test("creates a post when authenticated", async () => {
    const res = await request(app)
      .post("/feedup/posts")
      .set("Cookie", userACookie)
      .send({ post: "My first post" });

    expect(res.statusCode).toBe(201);
    expect(res.body.feed.post).toBe("My first post");
  });

  test("rejects post creation without authentication", async () => {
    const res = await request(app)
      .post("/feedup/posts")
      .send({ post: "Should fail" });

    expect(res.statusCode).toBe(401);
  });

  test("rejects post creation with empty text", async () => {
    const res = await request(app)
      .post("/feedup/posts")
      .set("Cookie", userACookie)
      .send({ post: "" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("No post provided");
  });
});

describe("DELETE /feedup/posts/:id (authorization)", () => {
  test("owner can delete their own post", async () => {
    const createRes = await request(app)
      .post("/feedup/posts")
      .set("Cookie", userACookie)
      .send({ post: "Post to delete" });

    const postId = createRes.body.feed._id;

    const deleteRes = await request(app)
      .delete(`/feedup/posts/${postId}`)
      .set("Cookie", userACookie);

    expect(deleteRes.statusCode).toBe(200);
  });

  test("non-owner cannot delete another user's post", async () => {
    const createRes = await request(app)
      .post("/feedup/posts")
      .set("Cookie", userACookie)
      .send({ post: "User A's post" });

    const postId = createRes.body.feed._id;

    // User B tries to delete User A's post — should be blocked
    const deleteRes = await request(app)
      .delete(`/feedup/posts/${postId}`)
      .set("Cookie", userBCookie);

    expect(deleteRes.statusCode).toBe(403);
    expect(deleteRes.body.error).toBe("Unauthorized to delete this post");
  });
});

describe("PUT /feedup/posts/:id (authorization)", () => {
  test("owner can update their own post", async () => {
    const createRes = await request(app)
      .post("/feedup/posts")
      .set("Cookie", userACookie)
      .send({ post: "Original text" });

    const postId = createRes.body.feed._id;

    const updateRes = await request(app)
      .put(`/feedup/posts/${postId}`)
      .set("Cookie", userACookie)
      .send({ post: "Updated text" });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.feed.post).toBe("Updated text");
  });

  test("non-owner cannot update another user's post", async () => {
    const createRes = await request(app)
      .post("/feedup/posts")
      .set("Cookie", userACookie)
      .send({ post: "User A's post" });

    const postId = createRes.body.feed._id;

    const updateRes = await request(app)
      .put(`/feedup/posts/${postId}`)
      .set("Cookie", userBCookie)
      .send({ post: "Hacked text" });

    expect(updateRes.statusCode).toBe(403);
    expect(updateRes.body.error).toBe("Unauthorized to update this post");
  });
});

describe("PATCH /feedup/posts/:id/upvote (toggle + self-vote block)", () => {
  test("a different user can upvote a post", async () => {
    const createRes = await request(app)
      .post("/feedup/posts")
      .set("Cookie", userACookie)
      .send({ post: "Upvote me" });

    const postId = createRes.body.feed._id;

    const upvoteRes = await request(app)
      .patch(`/feedup/posts/${postId}/upvote`)
      .set("Cookie", userBCookie);

    expect(upvoteRes.statusCode).toBe(200);
    expect(upvoteRes.body.message).toBe("Upvoted successfully");
  });

  test("owner cannot upvote their own post", async () => {
    const createRes = await request(app)
      .post("/feedup/posts")
      .set("Cookie", userACookie)
      .send({ post: "Can't upvote my own" });

    const postId = createRes.body.feed._id;

    const upvoteRes = await request(app)
      .patch(`/feedup/posts/${postId}/upvote`)
      .set("Cookie", userACookie);

    expect(upvoteRes.statusCode).toBe(403);
    expect(upvoteRes.body.error).toBe("Cannot upvote your own post");
  });

  test("upvoting twice removes the vote (toggle behavior)", async () => {
    const createRes = await request(app)
      .post("/feedup/posts")
      .set("Cookie", userACookie)
      .send({ post: "Toggle test" });

    const postId = createRes.body.feed._id;

    // First upvote — should add the vote
    const firstUpvote = await request(app)
      .patch(`/feedup/posts/${postId}/upvote`)
      .set("Cookie", userBCookie);
    expect(firstUpvote.body.message).toBe("Upvoted successfully");

    // Second upvote by same user — should remove the vote
    const secondUpvote = await request(app)
      .patch(`/feedup/posts/${postId}/upvote`)
      .set("Cookie", userBCookie);
    expect(secondUpvote.body.message).toBe("Upvote removed");
  });
});