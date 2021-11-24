const express = require('express');
const needle = require('needle');

require('dotenv').config();

const app = express();

let notes = '';

const getTwitterId = async (req, res) => {
  const params = {
    'user.fields': 'id_str',
  };

  const endpointURL = `https://api.twitter.com/2/users/by/username/${req.params.username}`;

  const response = await needle('get', endpointURL, params, {
    header: {
      authorization: `Bearer ${process.env.BEARER_TOKEN}`,
    },
  });

  console.log('Req params', req.params);

  if (response.statusCode !== 200) {
    if (response.statusCode === 403) {
      res.status(403).send(response.body);
    } else {
      throw new Error(response.body.error.message);
    }
  }
  if (response.body) {
    console.log(response.body);
    return response.body;
  } else throw new Error('Unsuccessful Request');
};

app.get('/api/tweet/:username', getTwitterId);

app.get('/api/notes', (request, response) => {
  response.json(notes);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
