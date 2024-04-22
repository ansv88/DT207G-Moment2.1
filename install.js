const { Client } = require("pg");
require("dotenv").config();

//Anslut till databasen
const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: {
        rejectUnauthorized: false,
    }
});

//Loggning av anslutning till databas
client.connect((err) => {
    if (err) {
        console.error("Fel vid anslutning: " + err);
    } else {
        console.log("Ansluten till databasen");
    }
});

//Skapa tabell
client.query(`
    CREATE TABLE workexperience(
        id SERIAL PRIMARY KEY,
        companyname TEXT NOT NULL,
        jobtitle TEXT NOT NULL,
        location TEXT NOT NULL,
        start_date DATE,
        end_date DATE,
        description TEXT NOT NULL
    )
`);