const sequelize = require("sequelize");

const BotsInstance = new sequelize.Sequelize({
  dialect: "mysql",
  host: "217.182.253.132",
  port: 3306,
  username: "millenium",
  password: "AWJzuR7QDbY4Lx5q",
  database: "manager",
  logging: false,
  define: {
      timestamps: true
  }
});

const GuildsInstance = new sequelize.Sequelize({
  dialect: "mysql",
  host: "217.182.253.132",
  port: 3306,
  username: "millenium",
  password: "AWJzuR7QDbY4Lx5q",
  database: "coinsbot",
  logging: false,
  define: {
      timestamps: true
  }
});

module.exports = { BotsInstance, GuildsInstance };