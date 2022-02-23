# Welcome the the Hike and Fly World Ranking project.

We would like to test the idea of creating a simple method to rank pilots according to their results.
We know WPRS from CIVL but mostly think it is an overkill and would like to rely on a more widely known and supported algorythm such as Bradley-Terry (maybe).
We aknowledge this project is focused on ranking Hike and Fly Pilots but would like the app to be usable for other sports as well.

## Installation Guide.
This is a nodejs application, build on top of Express.
- Install nodejs.
- Clone this repo. - git clone
- Install expressJS and all project dependencies (package.json) - npm install

## Database MYSQL or POSTGRESQL - SEQUELIZE.
This project is heavily relational and we choosed to rely on sequelize.
- Install MSYQL or POSTGRES with POSTGIS extension.
- Create an empty Database.
- Duplicate config.example.json into config.js and set the connection parameters to your database properly.
- The rest (table creation, indexes...) is done alone via sequelize.

## Choosed Stack.
Nodejs, Express, MYSQL or POSTGRESQL, sequelize, leaflet, bootstrap.

###  V1. minimal requirements.
- Events pages basic informations along with results upload.
- Monthly or instant world ranking based on past results.
- Different ranking based on different type of results.

### Work update : ALPHA version
- Event creation / update / delete is ok.
- Results storage along with confirmation page and form.
- Quick retrieve of pilots at result form submit.
- Event Types creation / deletion is ok. (Need update at least for colors).
- Planning calendar need more work. (Need years navigation + event names).
- Map is displyaing created events. (need a related timeline below).
- Athlete and results are stored.
- Elos (both overall and local) are calculated and stored.

- Current implementation face multiplayer elo statistical trouble.
Offering to gain / loose too much points in case of event with many contestant. Need fix
  
- Event page display Elos gained / Loss during event.
- No overall pages at the moment @todo. 

Non profit. Licence GPL. Help needed.