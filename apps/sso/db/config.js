require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const base = {
  dialect: 'postgres',
  seederStorage: 'sequelize',
};

if (process.env.DATABASE_URL) {
  module.exports = {
    ...base,
    url: process.env.DATABASE_URL,
    dialectOptions: { ssl: { rejectUnauthorized: false } },
  };
} else {
  module.exports = {
    ...base,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'tecopos',
    password: process.env.DB_PASSWORD || 'tecopos123',
    database: process.env.DB_NAME || 'tecopos_sso',
  };
}
