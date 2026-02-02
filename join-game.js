// Join Blooket game using our worker
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithCustomToken } = require('firebase/auth');
const { getDatabase, ref, set, onValue } = require('firebase/database');

const WORKER_URL = "https://blooket.mojhehmod.workers.dev";

// Random blooks like they use
const fblooks = [
  "Chick", "Chicken", "Cow", "Goat", "Horse", "Pig", "Sheep", "Duck", "Alpaca",
  "Dog", "Cat", "Rabbit", "Goldfish", "Hamster", "Turtle", "Kitten", "Puppy",
  "Bear", "Moose", "Fox", "Raccoon", "Squirrel", "Owl", "Hedgehog", "Deer",
  "Wolf", "Beaver", "Tiger", "Orangutan", "Cockatoo", "Parrot", "Anaconda",
  "Jaguar", "Macaw", "Toucan", "Panther", "Capuchin"
];

async function joinGame(gameId, playerName) {
    console.log(`\n🎮 Joining game ${gameId} as "${playerName}"...`);
    
    // Step 1: Get token from our worker
    console.log('📡 Fetching token from worker...');
    const response = await fetch(WORKER_URL + '/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: gameId, name: playerName })
    });
    
    const body = await response.json();
    console.log('📦 Response:', JSON.stringify(body, null, 2));
    
    if (!body.success && !body.fbToken) {
        console.error('❌ Failed to get token:', body.msg || body);
        return;
    }
    
    console.log('✅ Got token! Shard:', body.fbShardURL);
    
    // Step 2: Initialize Firebase with the shard URL (exactly like they do)
    console.log('🔥 Initializing Firebase...');
    const liveApp = initializeApp({
        apiKey: "AIzaSyCA-cTOnX19f6LFnDVVsHXya3k6ByP_MnU",
        authDomain: "blooket-2020.firebaseapp.com",
        projectId: "blooket-2020",
        storageBucket: "blooket-2020.appspot.com",
        messagingSenderId: "741533559105",
        appId: "1:741533559105:web:b8cbb10e6123f2913519c0",
        measurementId: "G-S3H5NGN10Z",
        databaseURL: body.fbShardURL,
    }, Date.now().toString());
    
    // Step 3: Sign in with custom token
    console.log('🔐 Signing in with custom token...');
    const auth = getAuth(liveApp);
    await signInWithCustomToken(auth, body.fbToken);
    console.log('✅ Signed in!');
    
    // Step 4: Join the game by setting player data
    console.log('👤 Setting player data...');
    const db = getDatabase(liveApp);
    const randomBlook = fblooks[Math.floor(Math.random() * fblooks.length)];
    
    await set(ref(db, `${gameId}/c/${playerName}`), {
        b: randomBlook,
        rt: true
    });
    
    console.log(`\n🎉 SUCCESS! Joined game ${gameId} as "${playerName}" with blook "${randomBlook}"`);
    
    // Listen for game updates
    console.log('\n👀 Listening for game updates (press Ctrl+C to exit)...\n');
    onValue(ref(db, gameId), (snapshot) => {
        const data = snapshot.val();
        if (data && data.s) {
            console.log(`📊 Game type: ${data.s.t || 'Unknown'}, Stage: ${data.s.stg || 'Unknown'}`);
        }
    });
}

// Get args
const gameId = process.argv[2] || '7478101';
const playerName = process.argv[3] || 'CopilotBot';

joinGame(gameId, playerName).catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
