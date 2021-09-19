const express = require("express");
const router = require("./router/router");
const app = express();
const PORT = process.env.PORT || 3000;

const Middleware = new (require("./middleware/middleware"))();

app.set("/favicon.ico", express.static("favicon.ico"));
app.use("/", router);
app.use(Middleware.validateApiKey);

app.listen(PORT, () => {
  console.log("App is running on port " + PORT);
});
