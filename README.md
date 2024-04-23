# Webbtjänst (API) för att hantera arbetslivserfarenheter
Det här repot innehåller kod för ett enklare REST API byggt med Express. APIet är byggt för att hantera arbetslivserfarenhet/jobb som en form av CV. APIet är uppbyggt med CRUD (Create, Read, Update, Delete).

## Länk
En liveversion av APIet finns tillgänglig på följande URL: [https://dt207g-moment2-1-iu33.onrender.com/]

## Installation, databas
APIet använder en PostgreSQL-databas.
Klona källkodsfilerna, kör kommando npm install för att installera nödvändiga npm-paket. Kör installations-skriptet install.js. 
Installations-skriptet skapar databastabell enligt nedanstående:
|Tabellnamn|Fält  |
|--|--|
|Tabell  | **id**, **companyname**, **jobtitle**, **location**, **start_date**, **end_date**, **description**  |

Observera att end_date är valbart att ange.


## Användning
Nedan finns beskrivet hur man når APIet med olika ändpunkter:

|Metod  |Ändpunkt            |Beskrivning                                                                           |
|-------|--------------------|--------------------------------------------------------------------------------------|
|GET    |/workexperience     |Hämtar all tillgänglig arbetslivserfarenhet.                                          |
|GET    |/workexperience/:id |Hämtar ett specifikt jobb med angivet ID.                                             |
|POST   |/workexperience     |Lagrar ett nytt jobb. Kräver att ett objekt skickas med.                              |
|PUT    |/workexperience/:id |Uppdaterar ett existerande jobb med angivet ID. Kräver att ett objekt skickas med.    |
|DELETE |/workexperience/:id |Raderar ett jobb med angivet ID.                                                      |

Ett objekt returneras/skickas som JSON med följande struktur:
```
  {
    "companyname": "Exempelföretaget AB",
    "jobtitle": "Senior webbutvecklare",
    "location": "Stockholm",
    "start_date": "2020-11-05",
    "end_date": "2022-05-20",
    "description": "Ansvarig för att utveckla och underhålla webbapplikationer."
  }
```