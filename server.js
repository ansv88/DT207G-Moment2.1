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
        console.error("Fel vid anslutning: " + err);
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
            console.error("Fel vid databasfråga: ", err); //Logga felmeddelande
            return res.status(500).json({ error: "Internt serverfel. Kontrollera loggar." }); //Svar med statuskod och felmeddelande
        }

        //Kontrollera om resultatet inte innehåller några rader.
        if (!result.rows.length) {
            return res.status(404).json({ error: "Ingen arbetslivserfarenhet hittades." }); //Svar med statuskod och felmeddelande
        }

        //Om databasfrågan fungerar som den ska, returnera statuskod samt datan från servern
        res.status(200).json({ workexperience: result.rows });
    });
});

//Lägg till ny arbetslivserfarenhet
app.post("/workexperience", async (req, res) => {
    //Skapa variabler med data från formuläret
    const companyname = (req.body.companyname || "").trim();
    const jobtitle = (req.body.jobtitle || "").trim();
    const location = (req.body.location || "").trim();
    const description = (req.body.description || "").trim();
    const start_date_str = req.body.start_date;
    const end_date_str = req.body.end_date;

    let errors = []; //Variabel med tom array för att lagra ev felmeddelanden i

    // Validering och felmeddelande för textinmatningarna //
    if (companyname === "") { errors.push("Ange ett företagsnamn"); }
    if (jobtitle === "") { errors.push("Ange en jobbtitel"); }
    if (location === "") { errors.push("Ange en plats"); }
    if (description === "") { errors.push("Ange en beskrivning av jobbet"); }

    // Validering och felmeddelanden för datum //
    //Validera startdatumet
    if (!start_date_str || isNaN(Date.parse(start_date_str))) {
        errors.push("Ogiltigt format på startdatum");
    }

    //Skapa variabel med Date-objekt om startdatumet är giltigt
    const start_date = new Date(start_date_str);

    //Variabel för slutdatumet
    let end_date;

    //Kontrollera om det finns ett slutdatum och validera det
    if (end_date_str) {
        if (isNaN(Date.parse(end_date_str))) {
            errors.push("Ogiltigt format på slutdatum");
        } else {
            //Skapa ett Date-objekt för slutdatumet
            end_date = new Date(end_date_str);
        }
    }

    //Om både startdatum och slutdatum finns, får inte startdatumet vara senare än slutdatumet
    if (end_date && start_date > end_date) { errors.push("Startdatum kan inte vara senare än slutdatum"); }

    //Kontrollera om det finns några fel i listan
    if (errors.length > 0) {
        //Returnera ett felmeddelande med alla fel
        return res.status(400).json({ errors });
    }

    //Lagra i databas
    try {
        await client.query("INSERT INTO workexperience(companyname, jobtitle, location, start_date, end_date, description)VALUES($1, $2, $3, $4, $5, $6)",
            [companyname, jobtitle, location, start_date, end_date, description]);
        //Svar till klienten att allt gick bra
        res.status(201).json({ message: "Arbetslivserfarenhet tillagd" });
    } catch (error) {
        //Logga och hantera eventuella fel vid databasfrågan med 500-status och meddelande
        console.error("Fel vid databasfråga: ", error);
        res.status(500).json({ error: "Internt serverfel" });
    }

});

//Uppdatera tillagd arbetslivserfarenhet
app.put("/workexperience/:id", async (req, res) => {
    const workid = req.params.id;
    const { companyname, jobtitle, location, start_date, end_date, description } = req.body;

    //Tomma arrayer för att sedan kunna sätta ihop SQL-frågan
    const updates = []; //Array som ska lagra de SQL-delar som behövs för att uppdatera kolumnvärden i tabellen
    const values = []; //Array som ska lagra själva värdena som ska uppdateras i databasen och tabellen
    let setIndex = 1; //Räknare för att hålla reda på placeholder-numret i SQL-frågan

    //Funktion för att lägga till SQL-uppdateringar om fälten inte är undefined
    function addUpdate(field, value) {
        if (value !== undefined) {
            updates.push(`${field} = $${setIndex++}`);
            values.push(value);
        }
    }

    //Kör funktionen med uppdateringar för varje fält
    addUpdate('companyname', companyname);
    addUpdate('jobtitle', jobtitle);
    addUpdate('location', location);
    addUpdate('start_date', start_date);
    addUpdate('end_date', end_date);
    addUpdate('description', description);

    //Lägg till workid som det sista värdet i values-arrayen
    values.push(workid);

    //Om inga uppdateringar har gjorts, returnera ett fel
    if (updates.length === 0) {
        return res.status(400).json({ error: "Inga uppdateringar är gjorda." });
    }

    //Skapa SQL-frågan för uppdatering
    const updateQuery = `UPDATE workexperience SET ${updates.join(', ')} WHERE id = $${setIndex}`;

    //Försök att köra SQL-frågan mot databasen
    try {
        const result = await client.query(updateQuery, values);
        //Om inga rader uppdaterades, skicka 404-status och meddelande att ingen arbetslivserfarenhet hittades
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Jobb med angivet ID hittades inte." });
        }
        //Om uppdateringen fungerade, skicka 200-status, meddelande och detaljer om det uppdaterade jobbet
        res.status(200).json({
            message: "Jobb uppdaterades.",
            updatedJob: { workid, companyname, jobtitle, location, start_date, end_date, description }
        });
    } catch (error) {
        //Logga och hantera eventuella fel vid databasfrågan med 500-status och meddelande
        console.error("Fel vid databasfråga: ", error);
        res.status(500).json({ error: "Internt serverfel. Kontrollera loggar." });
    }
});

//Ta bort en arbetslivserfarenhet
app.delete("/workexperience/:id", async (req, res) => {
    const workid = req.params.id;  //Hämta id

    //Försök radera arbetslivserfarenheten från databasen
    try {
        const result = await client.query("DELETE FROM workexperience WHERE id = $1", [workid]);

        //Kontrollera om någon rad faktiskt raderades
        if (result.rowCount === 0) {
            //Om ingen rad hittades med angivet ID, skicka 404-status och meddelande
            return res.status(404).json({ error: "Arbetslivserfarenhet med angett ID hittades inte." });
        }

        //Raderingen lyckades, skicka bekräftelse
        res.status(200).json({ message: "Arbetslivserfarenhet borttagen"});
    } catch (error) {
        //Logga och hantera eventuella fel vid databasfrågan med 500-status och meddelande
        console.error("Fel vid databasfråga: ", error);
        res.status(500).json({ error: "Internt serverfel. Kontrollera loggar." });
    }
});

app.listen(port, () => {
    console.log("Servern körs på port: " + port);
});