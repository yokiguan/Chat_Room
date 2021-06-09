const { ApolloServer, gql } = require("apollo-server");
const { getRooms, getUsers, getRecords } = require("./database");
const books = [
  {
    title: "Harry Potter and the Chamber of Secrets",
    author: "J.K. Rowling",
  },
  {
    title: "Jurassic Park",
    author: "Michael Crichton",
  },
];

const typeDefs = gql`
  type Room {
    room_id: String
    room_name: String
  }
  type User {
    user_id: String
    user_name: String
    password: String
  }
  type Record {
    record_id: String
    content: String
  }
  # 模型
  type Book {
    title: String
    author: String
  }

  # 查询
  type Query {
    books: [Book]
    rooms: [Room]
    users: [User]
    records: [Record]
  }
`;

// 解析器（决定查询，突变）返回什么数据
const resolvers = {
  Query: {
    books: () => books,
    users: () => getUsers(),
    rooms: () => getRooms(),
    records: () => getRecords(),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

// 可以使用 listen，也可以作为中间件与 express/koa 结合
server.listen({ port: 3000 }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
