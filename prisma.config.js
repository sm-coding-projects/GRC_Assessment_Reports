const path = require("node:path");
const { defineConfig } = require("prisma/config");

module.exports = defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL ??
      "postgresql://grc:grc_password@localhost:5432/grc_db",
  },
});
