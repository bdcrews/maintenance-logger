const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const jsonParser = bodyParser.json();

const {DATABASE_URL, PORT} = require('./config');
const {MaintenanceLog} = require('./models');

const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());

mongoose.Promise = global.Promise;



const requiredFields = (fields) => {
  console.log(fields);
  return (req, res, next) => {
    if (fields.every((field) => field in req.body)) {
      next();
    } 
    else {
      const missing = fields
        .filter((field) => !(req in body))
        .map((field) => '`' + field + '`')
        .join(', ');
      next({
        message: `Missing ${missing} in request body`,
        status: 400
      });
    }
  }
}


app.get('/records', (req, res) => {
  MaintenanceLog
    .find()
    .exec()
    .then(records => {
      res.json(records.map(record => record.apiRepr()));
    });
});

app.get('/records/:id', (req, res) => {
  MaintenanceLog
    .findById(req.params.id)
    .exec()
    .then(record => res.json(record.apiRepr()));
});

app.post('/records',
  jsonParser,  
  requiredFields(['part', 'status', 'lastMaintenance', 'frequency']),
  (req, res) => {
    MaintenanceLog.create({
      part: req.body.part,
      status: req.body.status,
      needsRepair: req.body.needsRepair,
      lastMaintenance: req.body.lastMaintenance,
      frequency: req.body.frequency
    })
    .then(maintenanceLog => {
      res.status(201).json(maintenanceLog.apiRepr());
      console.log(maintenanceLog.apiRepr());
    });
});


app.delete('/records/:id', (req, res) => {
  MaintenanceLog
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(() => {
      res.status(204).json({message: 'success'});
    });
});


/*

app.put('/records/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['title', 'content', 'author'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  MaintenanceLog
    .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
    .exec()
    .then(updatedPost => res.status(201).json(updatedPost.apiRepr()));
});


app.delete('/:id', (req, res) => {
  MaintenanceLogs
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(() => {
      console.log(`Deleted blog record with id \`${req.params.ID}\``);
      res.status(204).end();
    });
});
*/

app.use(express.static('public'));

app.use('*', function(req, res, next) {
  return(
      next({
        message: `Not Found`,
        status: 400
      })
    );
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status||500).send(err.message);
});

// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {runServer, app, closeServer};