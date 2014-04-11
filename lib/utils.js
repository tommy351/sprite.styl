var crypto = require('crypto'),
  fs = require('fs'),
  pathFn = require('path');

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