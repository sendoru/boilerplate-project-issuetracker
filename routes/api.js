'use strict';
const objectId = require('mongodb').ObjectId;

module.exports = function (app, db) {

  app.route('/api/issues/:project')

    .get(function (req, res) {
      let project = req.params.project;
      let params = req.query;

      if (!project) {
        return res.json({ error: 'No project provided' });
      }

      let db_query = {
        project: project,
        ...params
      };
      if (params._id) {
        db_query._id = objectId(params._id);
      }
      if (params.open) {
        db_query.open = params.open === 'true';
      }
      if (params.created_on) {
        db_query.created_on = new Date(params.created_on);
      }
      if (params.updated_on) {
        db_query.updated_on = new Date(params.updated_on);
      }

      db.find(db_query).toArray((err, issues) => {
        if (err) {
          console.error(err);
          return res.json({ error: 'Error fetching issues' });
        }
        res.json(issues);
      });

    })

    .post(function (req, res) {
      let project = req.params.project;
      let body = req.body;

      if (!project) {
        return res.json({ error: 'No project provided' });
      }
      if (!body.issue_title || !body.issue_text || !body.created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      db.insertOne({
        project: project,
        issue_title: body.issue_title,
        issue_text: body.issue_text,
        created_by: body.created_by,
        assigned_to: body.assigned_to || '',
        status_text: body.status_text || '',
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      }, (err, issue) => {
        if (err) {
          console.error(err);
          return res.json({ error: 'Error creating issue' });
        }
        res.json(issue.ops[0]);
      });
    })

    .put(function (req, res) {
      let project = req.params.project;
      let body = req.body;

      if (!project) {
        return res.json({ error: 'No project provided' });
      }
      if (!body._id) {
        return res.json({ error: 'missing _id' });
      }
      // body is empty except _id
      if (Object.keys(body).length <= 1) {
        return res.json({ error: 'no update field(s) sent', _id: body._id });
      }
      if (!objectId.isValid(body._id)) {
        return res.json({ error: 'could not update' });
      }

      const db_query = {
        project: project,
        ...body,
      };
      db_query.updated_on = new Date();
      if (body.open) {
        db_query.open = body.open === 'true';
      }
      // drop _id from query
      delete db_query._id;

      db.updateOne({
        _id: objectId(body._id)
      }, {
        $set: db_query
      }, (err, issue) => {
        if (err) {
          console.error(err);
          return res.json({ error: 'could not update', _id: body._id });
        }
        // no element with such _id
        if (issue.matchedCount === 0) {
          return res.json({ error: 'could not update', _id: body._id });
        }
        res.json({ result: 'successfully updated', _id: body._id });
      })
    })

    .delete(function (req, res) {
      let project = req.params.project;
      let body = req.body;

      if (!project) {
        return res.json({ error: 'No project provided' });
      }
      if (!body._id) {
        return res.json({ error: 'missing _id' });
      }
      if (!objectId.isValid(body._id)) {
        return res.json({ error: 'could not delete' });
      }

      db.deleteOne({
        _id: objectId(body._id)
      }, (err, issue) => {
        if (err) {
          console.error(err);
          return res.json({ error: 'could not delete', _id: body._id });
        }
        // no element with such _id
        if (issue.deletedCount === 0) {
          return res.json({ error: 'could not delete', _id: body._id });
        }
        res.json({ result: 'successfully deleted', _id: body._id });
      })
    });

};
