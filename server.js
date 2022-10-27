const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const SwaggerClient = require("swagger-client");
const salesforce = require("./salesforce.json");
const hubspot = require("./hubspot.json");
const jsf = require("json-schema-faker");

const services = {
  salesforce: salesforce,
  hubspot: hubspot,
};

app.listen(port, () => console.log(`Listening on port ${port}`));

app.use(express.json());

app.get("/express_backend", (req, res) => {
  res.send({ express: "YOUR EXPRESS BACKEND IS CONNECTED TO REACT" });
});

app.get("/services/:service/operations", (req, res) => {
  const service = services[req.params.service];
  const operationIds = [];
  Object.keys(service.paths).forEach((path) => {
    Object.keys(service.paths[path]).forEach((operation) => {
      if (
        service.paths[path][operation].hasOwnProperty("operationId") &&
        service.paths[path][operation].operationId
      ) {
        operationIds.push(service.paths[path][operation].operationId);
      }
    });
  });
  res.send(operationIds);
});

app.get("/services/:service/operations/:operationId", (req, res) => {
  const service = services[req.params.service];
  const operationId = req.params.operationId;
  let operationObj = {};

  jsf.option("alwaysFakeOptionals", true);

  Object.keys(service.paths).forEach((path) => {
    Object.keys(service.paths[path]).forEach((operation) => {
      if (
        service.paths[path][operation].hasOwnProperty("operationId") &&
        service.paths[path][operation].operationId === operationId
      ) {
        const parametersSchema = service.paths[path][operation].parameters && {
          type: "object",
          additionalProperties: false,
          properties: service.paths[path][operation].parameters.reduce(
            (obj, item) => Object.assign(obj, { [item.name]: item.schema }),
            {}
          ),
        };

        const parameters = parametersSchema && jsf.generate(parametersSchema);

        const requestBodySchema =
          service.paths[path][operation].requestBody?.content[
            "application/json"
          ]?.schema;

        const requestBody =
          requestBodySchema && jsf.generate(requestBodySchema);

        const serverVariablesSchema = service.servers[0].variables && {
          type: "object",
          additionalProperties: false,
          properties: Object.fromEntries(
            Object.keys(service.servers[0].variables).map((key) => [
              key,
              { type: "string" },
            ])
          ),
        };
        const serverVariables =
          serverVariablesSchema && jsf.generate(serverVariablesSchema);

        operationObj = {
          parameters,
          ...(requestBody && { requestBody }),
          ...(serverVariables && { serverVariables }),
        };
      }
    });
  });
  res.send(operationObj);
});

app.post("/services/:service/operations/:operationId", async (req, res) => {
  try {
    const service = services[req.params.service];
    const operationId = req.params.operationId;
    const access_token = req.header("Authorization");
    const data = req.body;
    const securityKey = Object.keys(service.components.securitySchemes)[0];
    const securityType = service.components.securitySchemes[securityKey].type;
    const authorized = {
      [securityKey]:
        securityType === "oauth2" ? { token: { access_token } } : access_token,
    };
    const result = await SwaggerClient.execute({
      spec: service,
      operationId: operationId,
      ...data,
      securities: {
        authorized,
      },
    });
    res.send(result);
  } catch (error) {
    console.warn(error);
    res.status(error.response?.status);
    return res.send(JSON.parse(error.response.data));
  }
});
