'use strict'
const odApi = require('./bin/openDota');
const fs = require('fs');
const colors = require('colors/safe');
const filePath = "D:/SteamLibrary/steamapps/common/dota 2 beta/game/dota/server_log.txt";
const mySteamID = "U:1:77274698"
console.log(`Watching for file changes on ${filePath}`);


let fsWait = false;
fs.watch(filePath, (event, filename) => {
  if (filename) {
    if (fsWait) return;
    fsWait = setTimeout(() => {
      fsWait = false;
    }, 1000);
    console.log(`${filename} file Changed`);
    fs.readFile(filePath,'utf8', function read(err, data) {
      if (err) {
        throw err;
      }
      let lines = data.split(/\r?\n/);
      for (let i = lines.length; i > 1;i--) {
        if ((lines[i] !== void(0)) && lines[i] != "" && lines[i] != " " && lines[i] !== null && lines[i] !== "\n") {
          var l = lines[i];
          break;
        }
      }
      console.log(l);

      if (l.indexOf("DOTA_GAMEMODE_ALL_DRAFT") > -1 || l.indexOf("DOTA_GAMEMODE_CM") > -1) {
        console.log(colors.green('New Game found!'));
        let playerStartIndex = l.indexOf('(') + 1;
        let playerEndIndex = l.indexOf(')');
        var PlayerSection = l.substring(playerStartIndex, playerEndIndex);
        let ids = PlayerSection.match(/U:[0-5]:[0-9]+/g);
        let radiant = false;
        for (let i = 0; i <= 4; i++) {
          if (ids[i] == mySteamID) {
            radiant = true;
          }
        }

        if (radiant) { ids = ids.slice(5, 10) } else { ids = ids.slice(0, 4) }
        getSuggestedBans(ids);
      }
    });
  }
});



let getSuggestedBans = async (ids) => {
  let allPlayerData = [];
  for (let id in ids) {
    let curId = ids[id].split(":").pop();
    let data = await odApi.getHeroesOfPlayer(curId);
    if (data != 0) {
      if (data.mmr_estimate == {}) data.mmr_estimate = { "estimate": 0 };
      allPlayerData.push(data);
    }
  }
  allPlayerData.sort(function (a, b) {
    if (a.mmr_estimate.estimate > b.mmr_estimate.estimate) return -1;
    if (a.mmr_estimate.estimate < b.mmr_estimate.estimate) return 1;
    return 0;
  });


  for (let player in allPlayerData) {
    let pHeroes = allPlayerData[player].topHeroes;
    let banHeroes = [];
    console.log(colors.green(allPlayerData[player].profile.personaname) + " (Est. MMR:" + allPlayerData[player].mmr_estimate.estimate + ")");
    for (let hero in pHeroes) {
      if (pHeroes[hero].winrate >= 55) {
        banHeroes.push()
        console.log(pHeroes[hero].hero_name + " WR(" + pHeroes[hero].winrate + ") Games:" + pHeroes[hero].games);
      }
    }
    console.log("\n");
  }

}


(async () => {
  try {
  } catch (err) {
    console.log(err);
  }
})();