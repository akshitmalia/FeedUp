require("dotenv").config({ path: "./.env" });

const request = require("supertest");
const mongoose = require("mongoose");
const express = require("express");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const User = require("./models/userschema");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/feedup", authRoutes);

const TEST_DB_URI = process.env.TEST_MONGODB_URI;

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.disconnect();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("POST /feedup/register", () => {
  test("registers a new user successfully", async () => {
    const res = await request(app)
      .post("/feedup/register")
      .send({ email: "test@example.com", password: "password123" });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User registered successfully");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  test("rejects registration with duplicate email", async () => {
    await request(app)
      .post("/feedup/register")
      .send({ email: "duplicate@example.com", password: "password123" });

    const res = await request(app)
      .post("/feedup/register")
      .send({ email: "duplicate@example.com", password: "differentpassword" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Email already registered");
  });

  test("rejects registration with missing password", async () => {
    const res = await request(app)
      .post("/feedup/register")
      .send({ email: "nopassword@example.com" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Email or Password not provided");
  });
});

describe("POST /feedup/login", () => {
  beforeEach(async () => {
    await request(app)
      .post("/feedup/register")
      .send({ email: "logintest@example.com", password: "correctpassword" });
  });

  test("logs in successfully with correct credentials", async () => {
    const res = await request(app)
      .post("/feedup/login")
      .send({ email: "logintest@example.com", password: "correctpassword" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Login successful");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  test("rejects login with wrong password", async () => {
    const res = await request(app)
      .post("/feedup/login")
      .send({ email: "logintest@example.com", password: "wrongpassword" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid password");
  });

  test("rejects login with non-existent email", async () => {
    const res = await request(app)
      .post("/feedup/login")
      .send({ email: "doesnotexist@example.com", password: "anything" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("User not found. Please register first.");
  });
});