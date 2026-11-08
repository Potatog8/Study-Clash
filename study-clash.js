const express = require("express");
const app = express();
const fs = require("fs");

app.use('/styles', express.static('./public/styles'));
app.use("/js", express.static("./public/js"));
app.use("/images", express.static("./public/images"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/html/index.html");
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/html/login.html");
});
app.get("/study", (req, res) => {
  res.sendFile(__dirname + "/public/html/study.html");
});
app.get("/home", (req, res) => {
  res.sendFile(__dirname + "/public/html/home.html");
});

app.get("/api/firebase-config", (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    appId: process.env.FIREBASE_APP_ID,
  });
});





// app.get('/favicon.ico', (req, res) => {
//     res.sendFile(__dirname + '/public/favicon.ico');
// });

app.listen(7000, () => {
  console.log("Server running at http://localhost:7000/");
});
