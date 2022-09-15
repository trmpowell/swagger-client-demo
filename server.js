const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const SwaggerClient = require("swagger-client");
const salesforce = require("./salesforce.json");
const jsf = require("json-schema-faker");

app.listen(port, () => console.log(`Listening on port ${port}`));

app.use(express.json());

app.get("/express_backend", (req, res) => {
  res.send({ express: "YOUR EXPRESS BACKEND IS CONNECTED TO REACT" });
});

app.get("/sf/operations", (req, res) => {
  const operationIds = [];
  Object.keys(salesforce.paths).forEach((path) => {
    Object.keys(salesforce.paths[path]).forEach((operation) => {
      if (
        salesforce.paths[path][operation].hasOwnProperty("operationId") &&
        salesforce.paths[path][operation].operationId
      ) {
        operationIds.push(salesforce.paths[path][operation].operationId);
      }
    });
  });
  res.send(operationIds);
});

app.get("/sf", (req, res) => {
  const operationId = req.query.operationId;
  let operationObj = {};
  Object.keys(salesforce.paths).forEach((path) => {
    Object.keys(salesforce.paths[path]).forEach((operation) => {
      if (
        salesforce.paths[path][operation].hasOwnProperty("operationId") &&
        salesforce.paths[path][operation].operationId === operationId
      ) {
        const parameters = salesforce.paths[path][operation].parameters?.reduce(
          (obj, item) => Object.assign(obj, { [item.name]: "" }),
          {}
        );
        const schema =
          salesforce.paths[path][operation].requestBody?.content[
            "application/json"
          ]?.schema;
        jsf.option("alwaysFakeOptionals", true);
        const requestBody = schema && jsf.generate(schema);
        operationObj = { parameters, ...(requestBody && { requestBody }) };
      }
    });
  });
  res.send(operationObj);
});

app.post("/sf", async (req, res) => {
  try {
    const operationId = req.query.operationId;
    const access_token = req.header("Authorization");
    const data = req.body;
    const result = await SwaggerClient.execute({
      spec: salesforce,
      operationId: operationId,
      ...data,
      securities: {
        authorized: {
          oauth: {
            token: { access_token },
          },
        },
      },
    });
    res.send(result);
  } catch (error) {
    console.warn(error);
    res.status(error.response?.status);
    return res.send(JSON.parse(error.response.data));
  }
});
