'use strict';

const chai = require('chai');
const faker = require('faker');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const should = chai.should();

const {MaintenanceRecord} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

// this function deletes the entire database.
// we'll call it in an `afterEach` block below
// to ensure  ata from one test does not stick
// around for next one
function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

// used to put randomish documents in db
// so we have data to work with and assert about.
// we use the Faker library to automatically
// generate placeholder values for part, status,
// needsRepair, lastMaintenance, and frequency
// and then we insert that data into mongo
function seedMaintenanceRecordData() {
  console.info('seeding maintenance data');
  const seedData = [];
  for (let i=1; i<=10; i++) {
    seedData.push({
    	part: faker.random.word(),
    	status: faker.hacker.adjective(),
    	needsRepair: ((Math.random() < 0.5) ? true : false),
    	lastMaintenance: faker.date.past(10),
    	frequency: faker.random.number()
    });
  }
  // this will return a promise
  return MaintenanceRecord.insertMany(seedData);
}


// test for index page
describe('index page', function() {
  it('exists', function(done) {
    chai.request(app)
      .get('/')
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.html;
        done();
    });
  });
});


describe('maintenance log API resource', function() {

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedMaintenanceRecordData();
  });

  afterEach(function() {
    // tear down database so we ensure no state from this test
    // effects any coming after.
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('GET endpoint', function() {

    it('should return all existing records', function() {
      // strategy:
      //    1. get back all records returned by by GET request to `/records`
      //    2. prove res has right status, data type
      //    3. prove the number of records we got back is equal to number
      //       in db.
      let res;
      let query = {
        query: {},
        location: {pageQuantity: 20},
        sort: {}
      };

      return chai.request(app)
        .get('/records')
        .query(query)
        .then(_res => {
          res = _res;
          res.should.have.status(200);
          // otherwise our db seeding didn't work
          res.body.should.have.length.of.at.least(1);

          return MaintenanceRecord.count();
        })
        .then(count => {
          // the number of returned records should be same
          // as number of records in DB
          res.body.should.have.lengthOf(count);
        });
    });

    it('should return record with right fields', function() {
      // Strategy: Get back all records, and ensure they have expected keys

      let resRecord;
      let query = {};
      query.query = {};
      query.location = {pageQuantity: 20};
      query.sort = {};
      return chai.request(app)
        .get('/records')
        .query(query)
        .then(function(res) {

          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.length.of.at.least(1);

          res.body.forEach(function(record) {
            record.should.be.a('object');
            record.should.include.keys('part', 'status', 'needsRepair', 'lastMaintenance', 'frequency');
          });
          // just check one of the records that its values match with those in db
          // and we'll assume it's true for rest
          resRecord = res.body[0];
          return MaintenanceRecord.findById(resRecord.id).exec();
        })
        .then(record => {
          resRecord.part.should.equal(record.part);
          resRecord.status.should.equal(record.status);
          resRecord.needsRepair.should.equal(record.needsRepair);
          resRecord.lastMaintenance.should.equal(record.lastMaintenance.toISOString()); //BDC_Need correct time format
          resRecord.frequency.should.equal(record.frequency);
        });
    });
  });

  describe('POST endpoint', function() {
    // strategy: make a POST request with data,
    // then prove that the record we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it('should add a new maintenance record', function() {

      const newRecord = {
    	part: faker.random.word(),
    	status: faker.hacker.adjective(),
    	needsRepair: faker.random.boolean(),
    	lastMaintenance: faker.date.past(10),
    	frequency: faker.random.number()
      };

      return chai.request(app)
        .post('/records')
        .send(newRecord)
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys('part', 'status', 'needsRepair', 'lastMaintenance', 'frequency');
          res.body.part.should.equal(newRecord.part);
          // cause Mongo should have created id on insertion
          res.body.id.should.not.be.null;
          res.body.part.should.equal(newRecord.part);
          res.body.status.should.equal(newRecord.status);
          res.body.needsRepair.should.equal(newRecord.needsRepair);
          res.body.lastMaintenance.should.equal(newRecord.lastMaintenance.toISOString()); //BDC_Need correct time format
          res.body.frequency.should.equal(newRecord.frequency);
          return MaintenanceRecord.findById(res.body.id).exec();
        })
        .then(function(record) {
          record.part.should.equal(newRecord.part);
          record.status.should.equal(newRecord.status);
          record.needsRepair.should.equal(newRecord.needsRepair);
          record.lastMaintenance.should.eql(newRecord.lastMaintenance);
          record.frequency.should.equal(newRecord.frequency);
        });
    });
  });

  describe('PUT endpoint', function() {

    // strategy:
    //  1. Get an existing record from db
    //  2. Make a PUT request to update that record
    //  3. Prove record returned by request contains data we sent
    //  4. Prove record in db is correctly updated
    it('should update fields you send over', function() {
      const updateData = {
      	part:  'testPart',
      	status: 'testStatus',
      	needsRepair: true,
      	lastMaintenance: '2017-09-01T00:00:00.000Z',
      	frequency: 99
      };

      return MaintenanceRecord
        .findOne()
        .exec()
        .then(record => {
          updateData.id = record.id;

          return chai.request(app)
            .put(`/records/${record.id}`)
            .send(updateData);
        })
        .then(res => {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.part.should.equal(updateData.part);
          res.body.status.should.equal(updateData.status);
          res.body.needsRepair.should.equal(updateData.needsRepair);
          res.body.lastMaintenance.should.equal(updateData.lastMaintenance);
          res.body.frequency.should.equal(updateData.frequency);

          return MaintenanceRecord.findById(res.body.id).exec();
        })
        .then(record => {
          record.part.should.equal(updateData.part);
          record.status.should.equal(updateData.status);
          record.needsRepair.should.equal(updateData.needsRepair);
          record.lastMaintenance.toISOString().should.equal(updateData.lastMaintenance);
          record.frequency.should.equal(updateData.frequency);
        });
    });
  });

  describe('DELETE endpoint', function() {
    // strategy:
    //  1. get a record
    //  2. make a DELETE request for that record's id
    //  3. assert that response has right status code
    //  4. prove that record with the id doesn't exist in db anymore
    it('should delete a record by id', function() {

      let record;

      return MaintenanceRecord
        .findOne()
        .exec()
        .then(_record => {
          record = _record;
          return chai.request(app).delete(`/records/${record.id}`);
        })
        .then(res => {
          res.should.have.status(204);
          return MaintenanceRecord.findById(record.id);
        })
        .then(_record => {
          // when a variable's value is null, chaining `should`
          // doesn't work. so `_record.should.be.null` would raise
          // an error. `should.be.null(_record)` is how we can
          // make assertions about a null value.
          should.not.exist(_record);
        });
    });
  });
});