require('dotenv').config();

module.exports = {
  development: {
    username: 'devops',
    password: 'devpassword',
    database: 'db_berkelana',
    host: 'localhost',
    port: '3306',
    dialect: 'mysql'
  },
  test: {
    username: 'devops',
    password: 'devpassword',
    database: 'db_berkelana',
    host: 'localhost',
    port: '3306',
    dialect: 'mysql'
  },
  production: {
   username: 'devops',
    password: 'devpassword',
    database: 'db_berkelana',
    host: 'localhost',
    port: '3306',
    dialect: 'mysql'
  }
};