const fetch = require('node-fetch');
const config = require('config');
const Bottleneck = require("bottleneck");
const heroes = require('./heroes.json').heroes;
var limiter = new Bottleneck({
    minTime: 333 // pick a value that makes sense for your use case
});

//var api_key = config.get("Bitskins.API_KEY");
//var secret = config.get("Bitskins.API_SECRET");

let apiRequest = async (apiParams, method) => {
    let err, data;
    try {
        let body = await fetch('https://api.opendota.com/api/' + apiParams + '/', {
            method: method
        }).catch(err => this.err = err);
        if (body.status != 200) {
            err = '\x1b[31m API-Error: ' + body.statusText + '\x1b[0m';
        }
        data = await body.json().catch(err => this.err = err);

    } catch (e) {
        console.log("Catch e:" + e);
        err = e;
    }
    return new Promise((resolve, reject) => {
        if (err) {
            reject(err);
        } else {
            resolve(data);
        }
    })
}


let getHeroesOfPlayer = async (id) => {
    let playerData = {};
    playerData = await limiter.schedule(apiRequest, 'players/' + id, 'get');
    let tdata = await limiter.schedule(apiRequest, 'players/' + id + '/heroes', 'get');

    if (playerData.hasOwnProperty("profile")) {
        if (playerData.profile.account_id == id) {
            tdata.sort(function (a, b) {
                if (a.games > b.games) return -1;
                if (a.games < b.games) return 1;
                return 0;
            });
            tdata = tdata.slice(0, 4);


            for (h in tdata) {
                let thero = heroes.find(o => o.id === parseInt(tdata[h].hero_id));
                tdata[h].hero_name = thero.localized_name;
                tdata[h].winrate = ((tdata[h].win / tdata[h].games) * 100).toFixed(2);
            }

            tdata.sort(function (a, b) {
                if (a.winrate > b.winrate) return -1;
                if (a.winrate < b.winrate) return 1;
                return 0;
            });

            playerData.topHeroes = tdata;
            return playerData;
        } else {
            return 0;
        }
    } else {
        return 0;
    }
    }

    let getPlayerInfo = async (id) => {
        return 0;
    }




    module.exports.getHeroesOfPlayer = getHeroesOfPlayer;

    module.exports.getPlayerInfo = getPlayerInfo;