const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {MaintenanceRecord} = require('./models');

const requiredFields = (fields) => {
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

router.get('/',
  (req, res) => {
    let pageQuantity = parseInt(req.query.location.pageQuantity);
    let skipAmount = parseInt(req.query.location.currentPage) * pageQuantity;

  MaintenanceRecord
    .find(req.query.query)
    .sort(req.query.sort)
    .skip(skipAmount)
    .limit(pageQuantity)
    .exec()
    .then(records => {
      res.json(records.map(record => record.apiRepr()));
    });
});

router.get('/:id', (req, res) => {
  MaintenanceRecord
    .findById(req.params.id)
    .exec()
    .then(record => res.json(record.apiRepr()));
});

router.post('/',
  jsonParser,  
  requiredFields(['part', 'status', 'lastMaintenance', 'frequency']),
  (req, res) => {
  console.log(req.body);
    MaintenanceRecord.create({
      part: req.body.part,
      status: req.body.status,
      needsRepair: req.body.needsRepair,
      lastMaintenance: req.body.lastMaintenance,
      frequency: req.body.frequency
    })
    .then(maintenanceRecord => {
      res.status(201).json(maintenanceRecord.apiRepr());
    });
});

router.delete('/:id', (req, res) => {
  MaintenanceRecord
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(() => {
      res.status(204).json({message: 'success'});
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went terribly wrong'});
    });
});

router.put('/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['part', 'status', 'needsRepair', 'lastMaintenance', 'frequency'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  MaintenanceRecord
    .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
    .exec()
    .then(updatedPost => res.status(201).json(updatedPost.apiRepr()));
});

module.exports = router;