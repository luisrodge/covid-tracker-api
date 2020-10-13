const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

const data = require("./data.json");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const router = express.Router();

router.get("/", (req, res) => {
  res.json(data);
});

router.get("/districts", (req, res) => {
  res.json(data.districts);
});

router.put("/cases", (req, res) => {
  const { total, type, district } = req.body;

  switch (type) {
    case "active":
      for (let i = 0; i < data.cases.length; i++) {
        if (data.cases[i].district === district) {
          data.cases[i].active += total;
          break;
        }
      }
      break;
    case "recovered":
      data.recovered.total += total;

      for (let i = 0; i < data.cases.length; i++) {
        if (data.cases[i].district === district) {
          data.cases[i].active -= total;
          break;
        }
      }
      break;
    case "deceased":
      data.deaths.total += total;
      
      for (let i = 0; i < data.cases.length; i++) {
        if (data.cases[i].district === district) {
          data.cases[i].active -= total;
          break;
        }
      }
      break;
  }

  fs.writeFile("src/data.json", JSON.stringify(data, null, 2), function (err) {
    if (err) return console.log(err);
  });

  res.json(data);
});

app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app);
