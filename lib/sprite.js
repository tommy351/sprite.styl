var pathFn = require('path'),
  _ = require('lodash'),
  fs = require('fs'),
  imageSize = require('image-size'),
  glob = require('glob'),
  Canvas = require('canvas'),
  Image = Canvas.Image;

var uid = function(length){
  var src = 'abcdefghijklmnopqrstuvwxyz0123456789',
    srcLen = src.length,
    result = '';

  for (var i = 0; i < length; i++){
    result += src[parseInt(Math.random() * srcLen, 10)];
  }

  return result;
};

var Sprite = module.exports = function(options){
  var baseDir = options.base_dir,
    imageDir = pathFn.join(baseDir, options.image_dir),
    cachePath = pathFn.join(baseDir, options.cache_path),
    baseUrl = options.base_url,
    imageUrl = baseUrl + options.image_url,
    type = options.type,
    cache = {};

  var loadCache = function(){
    var exist = fs.existsSync(cachePath);

    if (exist){
      cache = require(cachePath);
    } else {
      cache = {
        files: {},
        list: {},
        map: {}
      };
    }
  };

  var saveCache = function(){
    fs.writeFileSync(cachePath, JSON.stringify(cache));
  };

  var imageInfo = function(path){
    var data = cache.files[path],
      src = pathFn.join(imageDir, path),
      exist = fs.existsSync(src);

    if (!exist){
      data = null;
      return {};
    }

    var stats = fs.statSync(src),
      mtime = stats.mtime.getTime();

    if (data && data.mtime === mtime){
      return data;
    }

    var size = imageSize(src);

    data = {
      mtime: mtime,
      width: size.width,
      height: size.height
    };

    return data;
  };

  loadCache();

  return {
    spriteMap: function(data){
      return function(name, options){
        //
      };
    },
    imageWidth: function(data){
      return new this.renderer.nodes.Unit(imageInfo(data.val).width, 'px');
    },
    imageHeight : function(data){
      return new this.renderer.nodes.Unit(imageInfo(data.val).height, 'px');
    }
  };
};