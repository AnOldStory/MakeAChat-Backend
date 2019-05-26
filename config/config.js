module.exports = {
  DATABASE: {
    host: "Write Yours",
    port: "5432", //"3306",
    user: "q",
    password: "q",
    database: "postgres"
  },
  DATABASE_URL: process.env.DATABASE_URL || "write down",
  SESSION_SECRET: "q",
  JWT_SECRET: "q"
};
