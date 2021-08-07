const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const app = express();
module.exports = app;
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server is running on http://localhost:3000/`);
    });
  } catch (error) {
    console.log(`DB error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };

// API-1 return list of all players in team
app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `
    SELECT * 
    FROM cricket_team;`;
  const allPlayersDetails = await db.all(getAllPlayersQuery);
  response.send(
    allPlayersDetails.map((eachPlayer) => 
        convertDbObjectToResponseObject(eachPlayer)
    )
    );
});

//API-2 creating a new player
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO
        cricket_team (player_name, jersey_number, role)
    VALUES
        ('${playerName}', ${jerseyNumber}, '${role}');`;
  await db.run(addPlayerQuery);
  response.send(`Player Added to Team`);
});

//API-3 Get player with player_id
app.get("/player/:playerId", async (request, response) => {
  const { player_Id } = request.params;
  const getPlayerQuery = `
    SELECT * 
    FROM cricket_team
    WHERE player_Id = ${player_Id};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

//API-4 Update player
app.put("/players/:playerId", async (request, response) => {
  const { player_Id } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
  UPDATE
    cricket_team
  SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  WHERE
    player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send(`Player Details Updated`);
});

//API-5 Delete player
app.delete("/player/:playerId", async (request, response) => {
  const { player_Id } = request.params;
  const deletePlayerQuery = `
    DELETE FROM 
        cricket_team
    WHERE 
        player_id = ${player_Id};`;
  await db.run(deletePlayerQuery);
  response.send(`Player Removed`);
});
