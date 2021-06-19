const express = require("express");
const cors = require("cors");
const listEndPoints = require("express-list-endpoints");
const { join } = require("path");
const mediaRouter = require("./services/media");

const {
  notFoundErrorHandler,
  unauthorizedErrorHandler,
  forbiddenErrorHandler,
  badRequestErrorHandler,
  catchAllErrorHandler,
} = require("./errorHandling");

const server = express();

const port = process.env.PORT || 3001;

server.use(cors());
server.use(express.json());

server.use("/media", mediaRouter);

server.use(badRequestErrorHandler);
server.use(notFoundErrorHandler);
server.use(forbiddenErrorHandler);
server.use(unauthorizedErrorHandler);
server.use(catchAllErrorHandler);

console.log(listEndPoints);

server.listen(port, () => {
  console.log("Server is running on port: ", port);
});
