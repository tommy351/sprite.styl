var _ = require('lodash'),
  pathFn = require('path'),
  Sprite = require('./sprite');

module.exports = function(options){
  options = _.extend({
    base_dir: process.cwd(),
    image_dir: 'images',
    cache_dir: '.stylus_cache',
    base_url: '/',
    image_url: 'images',
    layout: 'vertical',
    spacing: 0
  }, options);

  return function(style){
    var sprite = new Sprite(options);

    style.import(pathFn.join(__dirname, 'sprite.styl'));
    style.define('sprite-map', sprite.spriteMap);
    style.define('sprite-url', sprite.spriteUrl);
    style.define('sprite-position', sprite.spritePosition);
    style.define('image-width', sprite.imageWidth);
    style.define('image-height', sprite.imageHeight);
    style.define('image-url', sprite.imageUrl);
  };
};