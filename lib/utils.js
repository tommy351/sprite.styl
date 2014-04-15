var crypto = require('crypto'),
  fs = require('fs'),
  pathFn = require('path'),
  _ = require('lodash'),
  stylus = require('stylus');

exports = module.exports = _.clone(stylus.utils);

exports.uid = function(length){
  var src = 'abcdefghijklmnopqrstuvwxyz0123456789',
    srcLen = src.length,
    result = '';

  for (var i = 0; i < length; i++){
    result += src[parseInt(Math.random() * srcLen, 10)];
  }

  return result;
};

exports.md5 = function(str){
  return crypto.createHash('md5').update(str).digest('hex');
};

var mkdirsSync = exports.mkdirsSync = function(path){
  var parent = pathFn.dirname(path);

  if (!fs.existsSync(parent)){
    mkdirsSync(parent);
  }

  fs.mkdirSync(path);
};

exports.writeFileSync = function(path, content){
  var parent = pathFn.dirname(path);

  if (!fs.existsSync(parent)){
    mkdirsSync(parent);
  }

  fs.writeFileSync(path, content);
};

exports.retinaFilePath = function(path, modifier){
  modifier = modifier || '@2x';

  var ext = pathFn.extname(path);

  return path.substring(0, path.length - ext.length) + modifier + ext;
};

exports.camelize = function(str){
  var split = str.split('-');
  if (split.length <= 1) return str;

  var result = split[0];

  for (var i = 1, len = split.length; i < len; i++){
    result += split[i][0].toUpperCase() + split[i].substring(1);
  }

  return result;
};