const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  let id;
  // Create an issue with every field: POST request to /api/issues/{project}
  test('Create an issue with every field', function (done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Title',
        issue_text: 'text',
        created_by: 'Functional Test - Every field',
        assigned_to: 'Chai and Mocha',
        status_text: 'In QA'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Title');
        assert.equal(res.body.issue_text, 'text');
        assert.equal(res.body.created_by, 'Functional Test - Every field');
        assert.equal(res.body.assigned_to, 'Chai and Mocha');
        assert.equal(res.body.status_text, 'In QA');
        id = res.body._id;
        done();
      });
  });

  // Create an issue with only required fields: POST request to /api/issues/{project}
  test('Create an issue with only required fields', function (done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Title',
        issue_text: 'text',
        created_by: 'Functional Test - Only required fields'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Title');
        assert.equal(res.body.issue_text, 'text');
        assert.equal(res.body.created_by, 'Functional Test - Only required fields');
        done();
      });
  });

  // Create an issue with missing required fields: POST request to /api/issues/{project}
  test('Create an issue with missing required fields', function (done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Title'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  // View issues on a project: GET request to /api/issues/{project}
  test('View issues on a project', function (done) {
    chai.request(server)
      .get('/api/issues/test')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  // View issues on a project with one filter: GET request to /api/issues/{project}
  test('View issues on a project with one filter', function (done) {
    chai.request(server)
      .get('/api/issues/test?open=true')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  // View issues on a project with multiple filters: GET request to /api/issues/{project}
  test('View issues on a project with multiple filters', function (done) {
    chai.request(server)
      .get('/api/issues/test?open=true&issue_title=Title')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  // Update one field on an issue: PUT request to /api/issues/{project}
  test('Update one field on an issue', function (done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({
        _id: id,
        issue_title: 'Title updated'
      })
      .end((err, res) => {
        // get updated title with get request
        chai.request(server)
          .get('/api/issues/test?_id=' + id)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body[0].issue_title, 'Title updated');
          });
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, id);
        done();
      });
  });

  // Update multiple fields on an issue: PUT request to /api/issues/{project}
  test('Update multiple fields on an issue', function (done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({
        _id: id,
        issue_title: 'Title updated again',
        issue_text: 'text updated'
      })
      .end((err, res) => {
        // get updated title and text with get request
        chai.request(server)
          .get('/api/issues/test?_id=' + id)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body[0].issue_title, 'Title updated again');
            assert.equal(res.body[0].issue_text, 'text updated');
          });
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, id);
        done();
      });
  });

  // Update an issue with missing _id: PUT request to /api/issues/{project}
  test('Update an issue with missing _id', function (done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({
        issue_title: 'Title updated'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  // Update an issue with no fields to update: PUT request to /api/issues/{project}
  test('Update an issue with no fields to update', function (done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({
        _id: id
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'no update field(s) sent');
        done();
      });
  });
  // Update an issue with an invalid _id: PUT request to /api/issues/{project}
  test('Update an issue with an invalid _id', function (done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({
        _id: 'invalid_id',
        issue_title: 'Title updated'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not update');
        done();
      });
  });

  // Delete an issue: DELETE request to /api/issues/{project}
  test('Delete an issue', function (done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({
        _id: id
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully deleted');
        assert.equal(res.body._id, id);
        done();
      });
  });

  // Delete an issue with an invalid _id: DELETE request to /api/issues/{project}
  test('Delete an issue with an invalid _id', function (done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({
        _id: 'invalid_id'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not delete');
        done();
      });
  });

  // Delete an issue with missing _id: DELETE request to /api/issues/{project}
  test('Delete an issue with missing _id', function (done) {
    chai.request(server)
      .delete('/api/issues/test')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

});
