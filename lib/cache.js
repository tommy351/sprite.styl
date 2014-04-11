var fs = require('fs'),
  _ = require('lodash'),
  utils = require('./utils');

var Cache = module.exports = function(path){
  this._path = path;
};

Cache.prototype.load = function(){
  if (!fs.existsSync(this._path)) return;

  var data = JSON.parse(fs.readFileSync(this._path, 'utf8'));

  for (var i in data){
    this[i] = data[i];
  }
};

Cache.prototype.save = function(){
  var obj = _.clone(this);
  delete obj._path;

  utils.writeFileSync(this._path, JSON.stringify(obj));
};