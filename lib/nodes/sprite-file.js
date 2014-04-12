var stylus = require('stylus'),
  nodes = stylus.nodes;

var SpriteFile = module.exports = function SpriteFile(data){
  this.path = data.path;
  this.x = new nodes.Unit(data.x, 'px');
  this.y = new nodes.Unit(data.y, 'px');
  this.width = new nodes.Unit(data.width, 'px');
  this.height = new nodes.Unit(data.height, 'px');
};

SpriteFile.prototype.__proto == nodes.Node.prototype;