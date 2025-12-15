import express from 'express';
import fetch from 'node-fetch';
import path from 'path';

async function getToken() {
  console.log('Api key:' + process.env.API_KEY);
  const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session: {
        "type": "realtime",
        "model": "gpt-realtime"
      }
    }),
  });
  const data = await response.json();
  console.log('Token:' + data.value);
  return data.value;
}

/////////////////////

const app = express();
const UI_PATH = 'ui/browser';

// openai token
app.get("/api/token", async (req, res) => {
  getToken().then(token => {
    res.send({ token });
  }).catch(error => {
    console.error(error);
    res.sendStatus(501);
  });
});

// ui, assets
app.use('/', express.static(UI_PATH));

// redirect everything to index.html, use client-side routing
app.get('/{*path}', (req, res) => {
  res.sendFile(path.resolve(UI_PATH + '/index.html'));
});

// error handler
app.use((error, req, res, next) => {
  console.error('Error handled:', error);
  res.status(500);
});

console.log('Listening to port ' + process.env.PORT);
app.listen(process.env.PORT);