/**
  Double Nines Chickenfoot
  Jacob Wilson 2022
**/
var TURN_COUNTER = 0;
var GAME_OVER = false;
var CURRENT_PLAYER_INDEX = 0; // PLAYERS[CURRENT_PLAYER_INDEX]
var NO_MORE_PLAYS_COUNTER = 0; // if this gets to n > num of players there are no more moves
var BUCKET = []; // all dominoes
var FEET = []; // chicken feet in play
var COMPLETED_FEET = []; // archived chicken feet for gui
var PLAYERS = []; // [["playerID", [playerHand], points], ["playerID", [playerHand], points]]
var STARTING_DOUBLE = 9;

function sim(numOfPlayers) {

    for (let i = 0; i < numOfPlayers; i++) {
        PLAYERS.push([`player-${i + 1}`, []]);
    }
    pickStartingDominoes();

    for (let i = 0; i < PLAYERS.length; i++) {
        console.log(PLAYERS[i]);
    }

    console.log(`Looking for ${STARTING_DOUBLE},${STARTING_DOUBLE} to start`);
    let starter = findStartingDomino();


    console.log(`${starter[2]} will start with ${starter[0]},${starter[1]}`);
    FEET.push([starter]); // we need two trees to start
    FEET.push([starter]);
    removeDominoFromHand(starter);

    let secondPlayerIndex = parseInt(starter[2].charAt(7)); // the index on which to start the game
    if (secondPlayerIndex == PLAYERS.length) {
        secondPlayerIndex = 0;
    }

    // https://stackoverflow.com/questions/19058858/jquery-append-in-loop-dom-does-not-update-until-the-end
    for (let i = secondPlayerIndex; i < PLAYERS.length; i++) { // MAIN GAME LOOP
      updateUI()

      if (NO_MORE_PLAYS_COUNTER == PLAYERS.length) { // the bucket is empty and no players can play
          break;
      }

      let play = findBestPlay(i);
      if (play === undefined) {
          hitTheBucket(i); // player gets one more chance once they hit the bucket
          play = findBestPlay(i);
      }

      if (play !== undefined) { // if the player has a valid play
          FEET[play[play.length - 1]].push(play);
          removeDominoFromHand(play);
          NO_MORE_PLAYS_COUNTER = 0;
          console.log(`${PLAYERS[i][0]} is playing ${play[0]},${play[1]} to ${FEET[play[play.length - 1]][0][0]},${FEET[play[play.length -1]][0][1]}`);

          if (play[0] != FEET[play[play.length - 1]][0][1]) {
              console.log("\nmismatch went through \n");
          }
      } else { // if the player hits the bucket and still doesn't get anything
          console.log(`${PLAYERS[i][0]} cannot play`)
      }

      if (PLAYERS[i][1].length < 1) {
          console.log(`${PLAYERS[i][0]} is out of dominoes`);
          break;
      }

      if (i == PLAYERS.length - 1) {
          i = -1;
      }

      splitFeet();
      TURN_COUNTER++;
      sleep(750);
    }

    // after the game loop ends
    for (var i = 0; i < numOfPlayers; i++) {
        let points = addThemUp(PLAYERS[i][1]);
        // PLAYERS[i][2] += points;
        console.log(`${PLAYERS[i][0]} finished with ${addThemUp(PLAYERS[i][1])} points`);
        // console.log(`${PLAYERS[i][0]} has ${PLAYERS[i][2]} total points`);
    }



    console.log(`game concluded in ${TURN_COUNTER} turns with ${FEET.length} spaces open to play`);
}

function setupTable(numOfPlayers) {
  initBucket();
  for (let i = 0; i < numOfPlayers; i++) {
      PLAYERS.push([`player-${i + 1}`, []]);
  }
  pickStartingDominoes();
  console.log(`Looking for ${STARTING_DOUBLE},${STARTING_DOUBLE} to start`);
  let starter = findStartingDomino();

  console.log(`${starter[2]} will start with ${starter[0]},${starter[1]}`);
  FEET.push([starter]); // we need two feet to start
  FEET.push([starter]);
  removeDominoFromHand(starter);

  CURRENT_PLAYER_INDEX = parseInt(starter[2].charAt(7)); // the index on which to start the game
  if (CURRENT_PLAYER_INDEX == PLAYERS.length) {
      CURRENT_PLAYER_INDEX = 0;
  }

}

function takeTurn() {
  let currentPlayer = PLAYERS[CURRENT_PLAYER_INDEX];
  if (NO_MORE_PLAYS_COUNTER == PLAYERS.length) { // the bucket is empty and no players can play
      cleanUp();
  }

  let play = findBestPlay(CURRENT_PLAYER_INDEX);
  if (play === undefined) {
      hitTheBucket(CURRENT_PLAYER_INDEX); // player gets one more chance once they hit the bucket
      play = findBestPlay(CURRENT_PLAYER_INDEX);
  }

  if (play !== undefined) { // if the player has a valid play
      FEET[play[play.length - 1]].push(play);
      removeDominoFromHand(play);
      NO_MORE_PLAYS_COUNTER = 0;
      console.log(`${PLAYERS[CURRENT_PLAYER_INDEX][0]} is playing ${play[0]},${play[1]} to ${FEET[play[play.length - 1]][0][0]},${FEET[play[play.length -1]][0][1]}`);

      if (play[0] != FEET[play[play.length - 1]][0][1]) {
          console.log("\nmismatch went through \n");
      }
    } else { // if the player hits the bucket and still doesn't get anything
        console.log(`${PLAYERS[CURRENT_PLAYER_INDEX][0]} cannot play`)
    }

    if (PLAYERS[CURRENT_PLAYER_INDEX][1].length < 1) {
        console.log(`${PLAYERS[CURRENT_PLAYER_INDEX][0]} is out of dominoes`);
        GAME_OVER = true;
    }

    if (CURRENT_PLAYER_INDEX == PLAYERS.length - 1) {
        CURRENT_PLAYER_INDEX = -1;
    }
  splitFeet();
  TURN_COUNTER++;
  if (!GAME_OVER) {
    setTimeout(takeTurn, 500);
  } else {
    cleanUp();
  }

  CURRENT_PLAYER_INDEX++;
}

function cleanUp() {
  // after the game loop ends
  for (var i = 0; i < PLAYERS.length; i++) {
      let points = addThemUp(PLAYERS[i][1]);
      // PLAYERS[i][2] += points;
      console.log(`${PLAYERS[i][0]} finished with ${addThemUp(PLAYERS[i][1])} points`);
      // console.log(`${PLAYERS[i][0]} has ${PLAYERS[i][2]} total points`);
  }
  console.log(`game concluded in ${TURN_COUNTER} turns with ${FEET.length} spaces open to play`);
}

function generateDominoArray() {
    var dc = []; // domino number collection
    var x = 0; // domino x value starting at 0
    for (var i = 0; i < 100; i++) {
        var y = (i % 10); // domino y value
        var d = [];
        d[0] = x; // domino object
        d[1] = y;

        var dup = false;
        for (var l = 0; l < dc.length; l++) { // this goes through the array as it is generated and checks for duplicate dominoes
            if ((dc[l][0] == d[0] && dc[l][1] == d[1]) || (dc[l][0] == d[1] && dc[l][1] == d[0])) {
                dup = true;
            }
        }

        if (!dup) {
            dc.push(d); // must not be a duplicate domino to be pushed
        }

        if (i > 0 && (i % 10) == 0) {
            x++;
        }
    }
    return dc; // returns 55 dominoes
}

function shuffleDominoes(array) {
    // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function initBucket() {
    BUCKET = generateDominoArray();
    shuffleDominoes(BUCKET);
}

function pickStartingDominoes() {
    for (let i = 0; i < PLAYERS.length; i++) {
        for (let j = 0; j < 40 / PLAYERS.length; j++) {
            let b = BUCKET.pop();
            b.push(PLAYERS[i][0]); // dominoes are x, y, playerID
            PLAYERS[i][1].push(b);
        }
    }
}

function findClosestLowerDouble(playerHand) {
    var closestMatch = [];
    for (var i = 0; i < playerHand.length; i++) {
        var x = playerHand[i][0];
        var y = playerHand[i][1];
        if (x == y) { // if the domino is a double
            if (x == STARTING_DOUBLE) { // if player has starting domino
                closestMatch = playerHand[i];
                break;
            } else if (x < STARTING_DOUBLE) { // domino must be less than or equal to starting domino to be considered
                if (closestMatch.length < 1) { // no matches yet
                    closestMatch = playerHand[i];
                } else if (playerHand[i][0] > closestMatch[0]) { // larger domino is closer to target
                    closestMatch = playerHand[i];
                }
            }
        }
    }

    return closestMatch;
}

function compareDouble(double1, double2) {
    var result = [];

    if (double1.length > 0 && double2.length > 0) { // both doubles are not empty
        if (double1[0] > double2[0]) {
            result = double1;
        } else {
            result = double2;
        }
    } else if (double1.length > 0 && double2.length == 0) {
        result = double1;
    } else if (double1.length == 0 && double2.length > 0) {
        result = double2;
    } else {
        return [];
    }

    return result;
}

function findStartingDomino() {
    let potentialStarters = []; // list of each players potential starter
    let starter = []; // the starter we will use
    let noStarters = false;
    for (let i = 0; i < PLAYERS.length; i++) { // iterate through player to find appropriate starting double
        potentialStarters.push(findClosestLowerDouble(PLAYERS[i][1]));
    }


    for (let i = 0; i < potentialStarters.length; i++) { // search potential starters for starting domino first
        if (potentialStarters[i][0] == STARTING_DOUBLE) { // this is the starting domino
            starter = potentialStarters[i];
            break;
        }
    }

    if (starter.length < 1) { // no one had the starting domino
        console.log(`No one had the starting domino`);

        if ((potentialStarters[0].length < 1) && (potentialStarters[1].length < 1) && (potentialStarters[2].length < 1) && (potentialStarters[3].length < 1)) {
            STARTING_DOUBLE = 9;
            for (let i = 0; i < PLAYERS.length; i++) {
                potentialStarters.push(findClosestLowerDouble(PLAYERS[i][1]));
            }
        }

        for (let i = 0; i < potentialStarters.length; i++) { // search for closest double
            if (starter.length < 1) { // no starter yet so assign the first double
                starter = potentialStarters[i]
            } else if (starter[0] < potentialStarters[i]) { // choose the bigger double; it will always be smaller than the starting double
                starter = potentialStarters[i]
            }
        }
    }
    return starter;
}

function findBestPlay(playerIndex) {
    let playerHand = [];
    for (var i = 0; i < PLAYERS[playerIndex][1].length; i++) { // we have to use this bc referencing the player hand directly will override
        playerHand.push(PLAYERS[playerIndex][1][i]);
    }

    let mandatoryDoubleIndex;
    let potentialPlays = [];
    let play;
    // is there a double we have to play
    for (let i = 0; i < FEET.length; i++) {
        let parentDomino = FEET[i][0];
        if (parentDomino[0] == parentDomino[1]) {
            mandatoryDoubleIndex = i;
            break;
        }
    }

    if (mandatoryDoubleIndex !== undefined) { // we have to play on a double
        let double = FEET[mandatoryDoubleIndex][0];
        for (let i = 0; i < playerHand.length; i++) {
            let playerDomino = playerHand[i];
            if (playerDomino[0] == double[1]) { // match no flip required
                let b = playerDomino;
                b.push(mandatoryDoubleIndex);
                potentialPlays.push(b);
                playerHand.splice(i, 1);
                i--;
            } else if (playerDomino[1] == double[1]) { // match flip required
                let b = [playerDomino[1], playerDomino[0], playerDomino[2]];
                b.push(mandatoryDoubleIndex);
                potentialPlays.push(b);
                playerHand.splice(i, 1);
                i--;
            }
        }
    } else { // free play
        for (let i = 0; i < FEET.length; i++) { // traverse feet
            let parent = FEET[i][0];
            for (let j = 0; j < playerHand.length; j++) { // traverse players hand
                let playerDomino = playerHand[j];
                if (playerDomino[0] == parent[1]) { // match no flip required
                    let b = playerDomino;
                    b.push(i);
                    potentialPlays.push(b);
                    playerHand.splice(j, 1);
                    j--;
                } else if (playerDomino[1] == parent[1]) { // match flip required
                    let b = [playerDomino[1], playerDomino[0], playerDomino[2]];
                    b.push(i);
                    potentialPlays.push(b);
                    playerHand.splice(j, 1);
                    j--;
                }
            }
        }
    }

    for (let i = 0; i < potentialPlays.length; i++) {
        if (play !== undefined) {
            if (calculateSum(potentialPlays[i]) > calculateSum(play)) {
                play = potentialPlays[i];
            }
        } else {
            play = potentialPlays[i];
        }
    }

    return play;
}

function calculateSum(domino) {
    return domino[0] + domino[1];
}

function calculatePoints(domino) {
    if ((domino[0] == domino[1]) && (domino[0] == 0)) {
        return 50;
    }
    return domino[0] + domino[1];
}

function hitTheBucket(playerIndex) {
    var b = [];
    try {
        b = BUCKET.pop();
        b.push(`player-${playerIndex + 1}`);
        PLAYERS[playerIndex][1].push(b);
        console.log(`${PLAYERS[playerIndex][0]} had to hit the bucket`)
    } catch (e) {
        console.log(`${PLAYERS[playerIndex][0]} had to hit the bucket but there was nothing left`)
        NO_MORE_PLAYS_COUNTER++;
    }
}

function removeDominoFromHand(domino) { // only domino as parameter since all dominoes have the id of the player who played it
    if (domino.length > 0) {
        const altDomino = [domino[1], domino[0], domino[2], domino[3]]
        const playerID = parseInt(domino[2].charAt(7));
        let hand = PLAYERS[playerID - 1][1];
        let index = hand.indexOf(domino);
        if (index.length < 1) {
            index = hand.indexOf(altDomino);
        }
        hand.splice(index, 1);
        PLAYERS[playerID - 1][1] = hand;
    }
}

function splitFeet() {
    for (let i = 0; i < FEET.length; i++) {
        if (FEET[i][0][0] == FEET[i][0][1]) {
            if (FEET[i].length > 3) { // check if a double had three children
                // console.log(`${FEET[i][0][0]}, ${FEET[i][0][1]} needs to be split`);
                FEET.push([FEET[i][1]]);
                FEET.push([FEET[i][2]]);
                FEET.push([FEET[i][3]]);
                FEET.splice(i, 1);
            }
        } else {
            if (FEET[i].length > 1) { // check if a single has one child
                // console.log(`${FEET[i][0][0]}, ${FEET[i][0][1]} needs to be split`);
                FEET.push([FEET[i][1]]);
                FEET.splice(i, 1);
            }
        }
    }
}

function addThemUp(hand) {
    var total = 0;
    for (var i = 0; i < hand.length; i++) {
        total += calculatePoints(hand[i]);
    }
    return total;
}

function sleep(milliseconds) {
    // https://www.sitepoint.com/delay-sleep-pause-wait/
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

setupTable(4);
takeTurn();
