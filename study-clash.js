const express = require('express');
const app = express();
const fs = require('fs');

app.use('/css', express.static('./public/styles'));
app.use('/js', express.static('./public/js'));
app.use('/images', express.static('./public/images'));

app.get("/api/firebase-config", (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    appId: process.env.FIREBASE_APP_ID,
  });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/index.html');
});

// app.get('/favicon.ico', (req, res) => {
//     res.sendFile(__dirname + '/public/favicon.ico');
// });



app.listen(7000, () => {
    console.log('Server running at http://localhost:7000/');
});