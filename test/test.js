const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const expect = chai.expect;

chai.use(chaiHttp);


describe('Dream Journal', function() {
  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  it('should get dreams on GET', function() {
    let myPromise = chai.request(app)
      .get('/dream-log')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        //const expectedKeys = ['ids', 'name', 'checked'];
        res.body.forEach(function(item) {
          expect(item).to.be.a('object');
         // expect(item).to.include.keys(expectedKeys);
        });
        //done();
      });
      return myPromise;
  });
/*
  // test strategy:
  //  1. make a POST request with data for a new item
  //  2. inspect response object and prove it has right
  //  status code and that the returned object has an `id`
  it('should add an item on POST', function() {
    const newItem = {name: 'coffee', checked: false};
    return chai.request(app)
      .post('/shopping-list')
      .send(newItem)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'name', 'checked');
        expect(res.body.id).to.not.equal(null);
        // response should be deep equal to `newItem` from above if we assign
        // `id` to it from `res.body.id`
        expect(res.body).to.deep.equal(Object.assign(newItem, {id: res.body.id}));
      });
  });

  // test strategy:
  //  1. initialize some update data (we won't have an `id` yet)
  //  2. make a GET request so we can get an item to update
  //  3. add the `id` to `updateData`
  //  4. Make a PUT request with `updateData`
  //  5. Inspect the response object to ensure it
  //  has right status code and that we get back an updated
  //  item with the right data in it.
  it('should update items on PUT', function() {
    // we initialize our updateData here and then after the initial
    // request to the app, we update it with an `id` property so
    // we can make a second, PUT call to the app.
    const updateData = {
      name: 'foo',
      checked: true
    };

    return chai.request(app)
      // first have to get so we have an idea of object to update
      .get('/shopping-list')
      .then(function(res) {
        updateData.id = res.body[0].id;
        // this will return a promise whose value will be the response
        // object, which we can inspect in the next `then` block. Note
        // that we could have used a nested callback here instead of
        // returning a promise and chaining with `then`, but we find
        // this approach cleaner and easier to read and reason about.
        return chai.request(app)
          .put(`/shopping-list/${updateData.id}`)
          .send(updateData);
      })
      // prove that the PUT request has right status code
      // and returns updated item
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.deep.equal(updateData);
      });
  });

  // test strategy:
  //  1. GET shopping list items so we can get ID of one
  //  to delete.
  //  2. DELETE an item and ensure we get back a status 204
  it('should delete items on DELETE', function() {
    return chai.request(app)
      // first have to get so we have an `id` of item
      // to delete
      .get('/shopping-list')
      .then(function(res) {
        return chai.request(app)
          .delete(`/shopping-list/${res.body[0].id}`);
      })
      .then(function(res) {
        expect(res).to.have.status(204);
      });
  });
});

describe('Recipes', function() {

  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  it('should list recipe items on GET', function() {
    return chai.request(app).get('/recipes').then(function(res) {
      expect(res).to.have.status(200);
      expect(res).to.be.json;
      expect(res.body).to.be.a('array');
      expect(res.body.length).to.be.at.least(0);
      const expectedKeys = ['id', 'name', 'ingredients'];
      res.body.forEach(function(object) {
        expect(object).to.be.a('object');
        expect(object).to.include.keys(expectedKeys);
      });
    });
  });

  it('should create recipe item on POST', function() {
    const newObject = {name: "guacamole", ingredients: ["avocado", "tomato", "red onion", "jalapeno"]};
    return chai.request(app).post('/recipes').send(newObject).then(function(res) {
      expect(res).to.have.status(201);
      expect(res).to.be.json;
      expect(res.body).to.be.a('object');
      expect(res.body).to.include.keys('id', 'name', 'ingredients');
      expect(res.body.id).to.not.equal(null);
      expect(res.body).to.deep.equal(Object.assign(newObject, {id: res.body.id}));
    });
  });
});

it('should update recipe item by id on PUT', function() {
  const newRecipe = {name: 'baked beans', ingredients: ['beans', 'other stuff']};
  return chai.request(app).get('/recipes')
  .then(function(res) {
    newRecipe.id = res.body[0].id;
    return chai.request(app).put(`/recipes/${newRecipe.id}`).send(newRecipe);
  })
  .then(function(res) {
    expect(res).to.have.status(204);
    expect(res.body).to.be.a('object');
  });
});

it('should delete recipe item by id on DELETE', function() {
  return chai.request(app).get('/recipes').then(function(res) {
    return chai.request(app).delete(`/recipes/${res.body[0].id}`);
  })
  .then(function(res) {
    expect(res).to.have.status(204);
  });*/
});
