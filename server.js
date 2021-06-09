const fastify = require("fastify")({
  logger: true,
});
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const NodeRSA = require("node-rsa");
const {
  getRooms,
  getUsers,
  getUserByName,
  getUserByID,
  getRecords,
  createRoom,
  createUser,
  createRecord,
  enterRoom,
  exitRoom,
  getRoomHistory,
} = require("./database");

const pubkey = ` -----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBALiP6fS5fWEajZjCHBouG4cpS/fFAjmU
jFVirq/DHidSX6MK862vZugvTmjtHrIJX5Ulbl9owraq5c7KRHxjO3ECAwEAAQ==
-----END PUBLIC KEY-----`;
const prikey = ` -----BEGIN PRIVATE KEY-----
MIIBVQIBADANBgkqhkiG9w0BAQEFAASCAT8wggE7AgEAAkEAuI/p9Ll9YRqNmMIc
Gi4bhylL98UCOZSMVWKur8MeJ1Jfowrzra9m6C9OaO0esglflSVuX2jCtqrlzspE
fGM7cQIDAQABAkEAkY+vjXveDv/KPXiagWtr+qXvbHLM1mz6YT17WNQirA9Ks7CG
/r3x+0QTM0PsW9qa6RIDiWsmt75Au7MD8tnZIQIhAPLXu9vD5Egya32OFNrdML+N
CzYIytOLIGUa1tv6SX/bAiEAwo/R350PYrxP7ZWW2a8ro9tYKqbRrizS7hcvrPJS
aaMCICyaLRnXJ+WOxSlhYDk2qQ51lFqPUNl70y5euJncpYVDAiAZvGZ5ms/3Mous
FLaAkwBFy3TtJ2XjEUDRh7WhvegS2wIhAPHRve3BcFmN2TuVE684n8YxYjWTX+m8
4fO3AZYhnGP8
-----END PRIVATE KEY-----`;

const public = new NodeRSA(pubkey, "pkcs8-public");
const private = new NodeRSA(prikey, "pkcs8-private");
const JWT = require("./jwt");

fastify.register(require("fastify-cors"), {
  origin: "http://localhost:3002",
  credentials: true,
  maxAge: 36000,
});
fastify.register(require("fastify-cookie"));

fastify.post("/verify", async (request, reply) => {
  let chat_sid = request.cookies.chat_sid;
  if (chat_sid) {
    let info = JWT.verify(chat_sid);
    if (info) {
      return reply.code(200).send({ code: 200, ...info });
    }
  }
  return reply.code(200).send({ code: 402, msg: "返回登录" });
});

fastify.post("/login", async (request, reply) => {
  let { username: user_name, password } = request.body;
  let res = await getUserByName({ user_name });

  for (let i = 0; i < res.length; i++) {
    let decryptedPwd = private.decrypt(res[i].password, "utf8");
    if (decryptedPwd === password) {
      const token = JWT.generate(
        { user_name, user_id: res[i].user_id, date: Date.now() },
        "24h"
      );
      return reply
        .cookie("chat_sid", token, {
          sameSite: "none",
          httpOnly: true,
          // domain: "localhost",
          secure: true,
        })
        .code(200)
        .send({ code: 200, user_id: res[i].user_id, user_name });
    }
  }
  return reply.code(200).send({ code: 401, msg: "用户名或密码错误" });
});

fastify.post("/register", async (request, reply) => {
  let { username: user_name, password } = request.body;
  let encryptedPwd = public.encrypt(password, "base64");
  let { code, msg } = await createUser({ user_name, password: encryptedPwd });
  reply.code(code).send(code === 200 ? { user_name, password } : { msg });
});

fastify.post("/logout", async (request, reply) => {
  request.cookies.chat_sid = null;
  return reply
    .code(200)
    .clearCookie("chat_sid", {
      sameSite: "none",
      httpOnly: true,
      domain: "localhost",
      secure: true,
    })
    .send({ code: 200, msg: "退出成功" });
});

fastify.post("/history_record", async (request, reply) => {
  let { room_id } = request.body;
  let res = await getRoomHistory(room_id);
  return reply
    .code(200)
    .send(res ? { code: 200, ...res } : { code: 401, msg: "没找到" });
});

fastify.post("/leave_room", async (request, reply) => {
  let { room_id, user_id } = request.body;
  await exitRoom({ room_id, user_id });
  return reply.code(200).send({ code: 200, msg: "退出成功" });
});

fastify.get("/rooms", async (request, reply) => {
  let rooms = await getRooms();
  return reply.code(200).send({ code: 200, rooms });
});

fastify.post("/rooms", async (request, reply) => {
  // let rooms = await getRooms();
  // console.log(rooms);
  let { room_name } = request.body;
  let room = await createRoom({ room_name });

  return reply
    .code(200)
    .send({ code: 200, room: { room_id: room, room_name } });
});

fastify.listen(3001, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`server listening on ${address}`);
});

const server = http.createServer(fastify);
const io = socketio(server, { cors: true });
(async () => {
  let rooms = await getRooms();
  rooms.forEach((room) => {
    let room_id = room.room_id;
    let nameSpace = "/" + room_id;
    io.of(nameSpace).on("connection", async (socket) => {
      console.log("this is the socket:", socket.request._query.user_id);
      let users = await getUserByID(socket.request._query.user_id);
      io.of(nameSpace).emit("join", { user: users[0] });
      await enterRoom({ room_id, user_id: users[0].user_id });

      socket.broadcast.emit("message", "joined"); // 除了本人
      // io.emit(); //所有人

      // 有人left
      socket.on("disconnect", async () => {
        io.of(nameSpace).emit("left", { user: users[0] });
        await exitRoom({ room_id, user_id: users[0].user_id });
      });

      // 监听聊天消息
      socket.on("chatMessage", async (msg) => {
        io.of(nameSpace).emit("chat_message", {
          msg,
          from: users[0].user_name,
          create_time: Date.now(),
        });
        let res = await createRecord({
          record_id: Date.now() + users[0].user_id + msg,
          content: msg,
          user_id: users[0].user_id,
          room_id: room_id,
        });
      });
    });
  });
})();

// app.use(express.static(path.join(__dirname, "")));
const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
