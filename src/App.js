import React, { useEffect, useState } from "react";
import "./App.css";

const eventMethod = (method) => (event) => method(event.target.value);

const Form = () => {
  const [accessToken, setAccessToken] = useState("");
  const [operationId, setOperationId] = useState("");
  const [body, setBody] = useState(JSON.stringify({}, null, " "));
  const [results, setResults] = useState();
  const [operationIds, setOperationIds] = useState([]);

  useEffect(() => {
    fetch(`/sf?operationId=${operationId}`)
      .then(async (result) => {
        if (result.ok) {
          const resultJson = await result.json();
          resultJson.serverVariables = { myDomain: "" };
          setBody(JSON.stringify(resultJson, null, "  "));
        } else {
          console.error(result);
        }
      })
      .catch(console.error);
  }, [operationId]);

  useEffect(() => {
    fetch("/sf/operations")
      .then(async (result) => {
        if (result.ok) {
          const resultJson = await result.json();
          setOperationIds(resultJson);
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!operationId) {
      alert("Select an operation");
      return;
    }
    try {
      const result = await fetch(`/sf?operationId=${operationId}`, {
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken,
        },
      });
      const contentType = result.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        setResults(await result.json());
      } else {
        setResults({ status: result.status, statusText: result.statusText });
      }
    } catch (e) {
      setResults(e);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: "40%" }}>
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: "column",
              height: "460px",
            }}
          >
            <div>
              <label>Access token</label>
              <input
                value={accessToken}
                onChange={eventMethod(setAccessToken)}
              />
            </div>
            <div>
              <label>
                Operation ID:&nbsp;
                <select
                  value={operationId}
                  onChange={eventMethod(setOperationId)}
                >
                  <option value="" label="--select one--" />
                  {operationIds.map((operationId) => (
                    <option
                      value={operationId}
                      label={operationId}
                      key={operationId}
                    />
                  ))}
                </select>
              </label>
            </div>
            <div>
              <textarea
                value={body}
                onChange={eventMethod(setBody)}
                style={{ height: "300px", width: "600px" }}
              />
            </div>
            <div>
              <input type="submit" value="Submit" />
            </div>
          </div>
        </form>
      </div>
      <div style={{ width: "40%", alignItems: "center", display: "flex" }}>
        <div
          style={{
            height: "300px",
            display: "flex",
            textAlign: "left",
            overflow: "auto",
            border: "1px solid #bbb",
          }}
        >
          <code>
            <pre>{results && JSON.stringify(results, null, " ")}</pre>
          </code>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <h1>Welcome! 👋</h1>
      <Form />
    </div>
  );
}

export default App;
