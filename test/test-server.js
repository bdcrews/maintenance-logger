const chai = require('chai');
const faker = require('faker');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const should = chai.should();

const {MaintenanceLog} = require('../models');
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
function seedMaintenanceLogData() {
  console.info('seeding maintenance data');
  const seedData = [];
  for (let i=1; i<=10; i++) {
    seedData.push({
    	part: faker.random.word(),
    	status: faker.hacker.adjective(),
    	needsRepair: "on",
    	lastMaintenance: faker.date.past(),
    	frequency: faker.random.number()
    });
  }
  // this will return a promise
  return MaintenanceLog.insertMany(seedData);
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
    return seedMaintenanceLogData();
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
      return chai.request(app)
        .get('/records')
        .then(_res => {
          res = _res;
          res.should.have.status(200);
          // otherwise our db seeding didn't work
          res.body.should.have.length.of.at.least(1);

          return MaintenanceLog.count();
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
      return chai.request(app)
        .get('/records')
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
          return MaintenanceLog.findById(resRecord.id).exec();
        })
        .then(record => {
          resRecord.part.should.equal(record.part);
          resRecord.status.should.equal(record.status);
          resRecord.needsRepair.should.equal(record.needsRepair);
          //resRecord.lastMaintenance.should.equal(record.lastMaintenance); //BDC_Need correct time format
          resRecord.frequency.should.equal(record.frequency);
        });
    });
  });
});