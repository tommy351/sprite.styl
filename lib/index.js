var _ = require('lodash'),
  Sprite = require('./sprite');

module.exports = function(options){
  options = _.extend({
    base_dir: process.cwd(),
    image_dir: 'images',
    cache_path: '.stylus_cache',
    base_url: '/',
    image_url: 'images',
    layout: 'vertical'
  }, options);

  return function(style){
    var sprite = new Sprite(options);

    style.define('sprite-map', sprite.spriteMap);
    style.define('image-width', sprite.imageWidth);
    style.define('image-height', sprite.imageHeight);
    style.define('image-url', sprite.imageUrl);
  };
};