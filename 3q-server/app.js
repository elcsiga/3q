import express from 'express';
import path from 'path';
import axios from 'axios';

export async function getToken() {
  console.log('Api key: ' + process.env.API_KEY);
  const response = await axios.post(
    'https://api.openai.com/v1/realtime/client_secrets',
    {
      session: {
        "type": "realtime",
        "model": "gpt-realtime"
      }
    },
    {
      headers: {
        'Authorization': 'Bearer ' + process.env.API_KEY ,
        'Content-Type': 'application/json',
      },
    }
  );
  console.log('Token (server):' + response.data.value);
  return response.data.value;
}

/////////////////////

export function startServer() {
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
}

startServer();