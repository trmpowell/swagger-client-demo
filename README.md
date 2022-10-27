# swagger-client demo

This repo provides a small demonstration of using swagger-client npm package with some Salesforce and HubSpot REST API methods.

It includes a basic react front-end to capture the API inputs and an express back-end to make the reqest to the API.

## Running

From the root, run `node server.js`, then run `npm start`.

### Inputs

#### Access token

Generate an OAuth access token that the API will execute with.

The easiest way to do this is via this method: https://developer.salesforce.com/docs/atlas.en-us.api_iot.meta/api_iot/qs_auth_access_token.htm

#### Operation ID

The server will pull the list of operation IDs from `salesforce.json` or `hubspot.json`. Select which operation you want to execute.

#### Body

Based on the selected operation ID, a body will be generated based on the `parameters` and schema for `responseBody` if applicable.

`serverVariables.myDomain` is added for Salesforce and is required to execute the request against the appropriate Salesforce org.

Populate the `parameters` and properties in `requestBody` and click `Submit` to execute the request.

### Response

Assuming the server was able to execute a request, the response will be displayed in the client.
