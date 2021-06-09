const knex = require("knex")({
  client: "mysql2",
  connection: {
    host: "127.0.0.1",
    user: "root",
    password: "chat-room",
    database: "chat_room",
  },
  pool: {
    min: 5,
    max: 1000,
  },
});

const getRooms = async () => {
  let res = await knex.select().from("rooms");
  console.log("rooms:", res);
  return res;
};

const createRoom = async ({ room_name }) => {
  let res = await knex("rooms").insert({ room_name });
  return res;
};

const enterRoom = async ({ room_id, user_id }) => {
  let res = await knex("room_users").where({ room_id, user_id });
  if (res && res.length)
    res = await knex("room_users")
      .where({ room_id, user_id })
      .update({ room_id, user_id });
  else res = await knex("room_users").insert({ room_id, user_id });
  return res;
};

const exitRoom = async ({ room_id, user_id }) => {
  let res = await knex("room_users").where({ room_id, user_id }).del();
  return res;
};

const getUsers = async () => {
  let res = await knex.select().from("users");
  console.log("users:", res);
  return res;
};

const getUserByName = async ({ user_name }) => {
  let res = await knex.from("users").where({ user_name }).select();
  console.log("user:", res);
  return res;
};

const getUserByID = async (user_id) => {
  let res = await knex.from("users").where({ user_id }).select();
  console.log("user:", res);
  return res;
};
const createUser = async ({ user_name, password }) => {
  let res = await knex("users").insert({ user_name, password });
  console.log("!!!!", res, user_name, password);

  return res
    ? { code: 200, user_name, password }
    : { code: 400, msg: "创建失败" };
};

const getRecords = async () => {
  let res = await knex.select().from("records");
  console.log("records:", res);
  return res;
};

const createRecord = async ({ record_id, content, user_id, room_id }) => {
  let res = await knex("records").insert({ record_id, content });
  let res2 = await knex("record_room_user").insert({
    record_id,
    room_id,
    user_id,
  });
  return { res, res2 };
};

const getRoomHistory = async (room_id) => {
  let list = await knex.from("record_room_user").where({ room_id }).select();
  let users = await knex.from("room_users").where({ room_id }).select();
  let recordsRes = [];
  let usersRes = [];
  for (let i = 0; i < list.length; i++) {
    let { user_id, record_id } = list[i];
    let records, users;
    records = await knex.from("records").where({ record_id }).select();
    users = await knex.from("users").where({ user_id }).select();
    recordsRes.push({
      msg: records[0].content,
      from: users[0].user_name,
      create_time: records[0].create_time,
    });
  }
  for (let i = 0; i < users.length; i++) {
    let { user_id } = users[i];
    let user = await knex.from("users").where({ user_id }).select();
    usersRes.push(user[0]);
  }
  return { users: usersRes, records: recordsRes };
};

module.exports = {
  knex,
  getRooms,
  createRoom,
  getUsers,
  createUser,
  getRecords,
  createRecord,
  getUserByName,
  getUserByID,
  getRoomHistory,
  enterRoom,
  exitRoom,
};
