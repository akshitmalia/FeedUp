module.exports = {
  testEnvironment: "node",
  testMatch: ["**/backend/**/*.test.js"],
  testPathIgnorePatterns: ["/node_modules/", "/frontend/dist/"],
  testTimeout: 120000,
  maxWorkers: 1,
};