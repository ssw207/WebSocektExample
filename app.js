const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http,{
  cors: {
    //origin: "http://127.0.0.1:5080,http://127.0.0.1:3000",
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const net = require("net");

app.use(express.static("public"));


//=============================================== 테스트용 websocket-client [XE화면] ==========================================
//websocket-client page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//webserver
http.listen(3000, () => {
  console.log("listening on *:3000");
});

// ================================================ 구현시 exe파일로 패키징 할 부분 ==============================================
//websocket-server
io.on("connection", (socket) => {
  console.log("websocket-server : client connected")

  //클라이언트에서 chat message로 이벤트 발송시 응답
  socket.on("chat message", (msg) => {
    //클라이언트로 chat message 이벤트 전달
    io.emit("chat message", msg);

    //tcp socket connection 생성후 클라이언트 리턴
    const client = getTcpClient(io);

    //tcp socket으로 데이터 전송
    console.log("websocket-server : data received from websocket-client [%s]",msg);
    const success = !client.write(msg);
    if (!success) {
      console.log("tcp-client : write to tcp-server success");
    } else {
      console.log("tcp-client : write to tcp-server failed");
    }
  });
});

//tcp socket client
function getTcpClient(io) {
  var client = net.connect({ port: 8123 }, function () {
    //'connect' listener
    console.log("tcp-client : connected to tcp-server");
  });

  client.on("data", function (data) {
    console.log("tcp-client : data receive from tcp-server [%s]", data.toString());
    io.emit("chat message", data.toString());
  });

  client.on("end", function () {
    console.log("tcp-client : client disconnected");
  });

  return client;
}



//======================================================== 테스트용 tcp-server [UC대용]=========================================
var server = net.createServer(function (client) {
  console.log("tcp-server : Client connected");
  
  client.on("data", function (data) {
    console.log("tcp-server : client send [%s]", data.toString());

    client.write("tcp-server response :"+data.toString());
  });

  //클라이언트 연결이 종료될경우
  client.on("end", function () {
    console.log("tcp-server : tcp-client disconnected");
  });
});

server.listen(8123, function () {
  //'listening' listener
  console.log("tcp-server : 8123 port listen");
});

server.on("error", function (e) {
  if (e.code == "EADDRINUSE") {
    console.log("Address in use, retrying...");
    setTimeout(function () {
      server.close();
      server.listen(8123, "localhost");
    }, 1000);
  }
});


