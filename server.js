const { Client } = require("pg");
const express = require("express");
require('dotenv').config();

const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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
        console.log("Fel vid anslutning: " + err);
    } else {
        console.log("Ansluten till databasen");
    }
});


//Routes
app.get("/workexperience", (req, res) => {
    //Läs ut från databasen
    client.query("SELECT * FROM workexperience ORDER BY id DESC", (err, result) => {

        //Kontrollera om det finns ett fel vid databasfrågan
        if (err) {
            console.error("Fel vid databasfråga: ", err); //Loggar felmeddelande
            return res.status(500).json({error: "Internt serverfel. Kontrollera loggar."}); //Svar med statuskod och felmeddelande
        }
        
        //Kontrollera om resultatet inte innehåller några rader.
        if (!result.rows.length) {
            return res.status(404).json({ error: "Ingen arbetslivserfarenhet hittades."}); //Svar med statuskod och felmeddelande
        }

        //Om databasfrågan fungerar som den ska, returnera statuskod samt datan från servern
        res.status(200).json({ workexperience: result.rows });
    });
});


app.get("/api/users", (req, res) => {
    res.json({ message: "Get users" });
});

app.post("/api/users", (req, res) => {
    let name = req.body.name;
    let email = req.body.email;

    //Error handling
    let errors = {
        message: "",
        detail: "",
        https_response: {

        }
    };

    if (!name || !email) {
        //Error messages
        errors.message = "Name and email not included";
        errors.detail = "Your must include both name and email in JSON";

        //Response code
        errors.https_response.message = "Bad request";
        errors.https_response.code = 400;

        res.status(400).json(errors);

        return;
    }

    let user = {
        name: name,
        email: email
    };

    res.json({ message: "User added", user });
});

app.put("/api/users/:id", (req, res) => {
    res.json({ message: "User updated: " + req.params.id });
});

app.delete("/api/users/:id", (req, res) => {
    res.json({ message: "User deleted: " + req.params.id });
});

app.listen(port, () => {
    console.log('Server is running on port: ' + port);
});