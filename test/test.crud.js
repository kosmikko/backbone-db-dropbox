var setup = require('./setup');
var should = require('chai').should();

describe('DropboxDb CRUD', function() {
  var model;
  var another;
  var collection;

  before(function(next) {
    var self = this;
    setup.setupDb(function() {
      self.Model = this.Model;
      self.Collection = this.Collection;
      self.db = this.db;
      self.dropbox = this.dropbox;
      next();
    });
  });

  after(function() {
    return model.destroy();
  });

  it('should create a new Model', function() {
    var dropbox = this.dropbox;
    model = new this.Model({
      title: 'testtitle',
      value: 45,
      id: 1
    });
    return model
      .save(null, {wait: true})
      .then(function() {
        dropbox.tests.length.should.equal(1);
      });
  });

  it('should create another Model', function() {
    var dropbox = this.dropbox;
    another = new this.Model({
      title: 'another title',
      value: 4,
      id: 2
    });
    return another
      .save(null, {wait: true})
      .then(function() {
        dropbox.tests.length.should.equal(2);
      });
  });

  it('should fetch the Model', function() {
    var dropbox = this.dropbox;
    var m = new this.Model({
      id: model.id
    });
    return m.fetch().then(function() {
      m.get('title').should.equal('testtitle');
    });
  });

  it('should fetch another Model', function() {
    var dropbox = this.dropbox;
    var m = new this.Model({
      id: another.id
    });
    return m.fetch().then(function() {
      m.get('title').should.equal('another title');
    });
  });

  it('should update model', function() {
    model.set('title', 'new title');
    return model.save();
  });

  it('should fetch updated model', function() {
    var m = new this.Model({
      id: model.id
    });
    return m
      .fetch()
      .then(function() {
        model.get('title').should.equal('new title');
      });
  });

  it('should fetch all models using Collection', function() {
    var collection = new this.Collection();
    return collection
      .fetch()
      .then(function() {
        collection.length.should.equal(2);
      });
  });

  it('should fetch with given where filter', function() {
    var collection = new this.Collection();
    return collection
      .fetch({
        where: {
          value: 45
        }
      }).then(function() {
        collection.length.should.equal(1);
      });
  });

  it('should destroy a Model', function() {
    var dropbox = this.dropbox;
    var m = new this.Model({
      id: another.id
    });
    return m.destroy().then(function() {
      dropbox.tests.length.should.equal(1);
    });
  });
});