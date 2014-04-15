module.exports = function(map, files){
  var spacing = map.spacing,
    length = files.length,
    x = 0,
    y = 0,
    width = 0,
    height = 0;

  for (var i = 0; i < length; i++){
    var file = files[i],
      fileWidth = file.width,
      fileHeight = file.height;

    width += fileWidth;
    height += fileHeight;

    file.x = x;
    file.y = y;

    x += fileWidth + spacing;
    y += fileHeight + spacing;
  }

  return {
    width: width + spacing * (length - 1),
    height: height + spacing * (length - 1)
  };
};