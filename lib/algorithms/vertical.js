module.exports = function(map, files){
  var spacing = map.spacing,
    length = files.length,
    y = 0,
    width = 0,
    height = 0;

  for (var i = 0; i < length; i++){
    var file = files[i],
      fileWidth = file.width,
      fileHeight = file.height;

    if (fileWidth > width) width = fileWidth;
    height += fileHeight;

    file.x = 0;
    file.y = y;

    y += fileHeight + spacing;
  }

  return {
    width: width,
    height: height + spacing * (length - 1)
  };
};