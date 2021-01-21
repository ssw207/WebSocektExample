const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const net = require("net");
const cors = require('cors');

app.use(express.static("public"));

//=============================================== 테스트용 websocket-client [XE화면] ==========================================
//websocket-client page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//webserver
http.listen(5080, () => {
  console.log("listening on *:5000");
});
