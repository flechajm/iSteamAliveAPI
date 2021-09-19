const express = require("express");
const router = require("./router/router");
const app = express();
const port = process.env.PORT || 3000;

const Middleware = new (require("./middleware/middleware"))();

app.use(Middleware.validateApiKey);
app.use("/favicon.ico", express.static("favicon.ico"));
app.use("/", router);

app.listen(port, () => {
  console.log("App is running on port " + port);
});
