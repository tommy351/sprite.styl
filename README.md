# sprite.styl

[![Build Status](https://travis-ci.org/tommy351/sprite.styl.png?branch=master)](https://travis-ci.org/tommy351/sprite.styl)

Stylus mixins for generating image sprites.

## Getting started

### Requirements

sprite.styl uses [node-canvas] to generate images. You have to install [Cairo] on your computer before getting started. See [here](https://github.com/LearnBoost/node-canvas/wiki/_pages) for more information.

### Installation

``` bash
$ npm install sprite.styl
```

### Usage

#### JavaScript

First, import sprite.styl to Stylus.

``` js
var stylus = require('stylus'),
    sprite = require('sprite.styl');

var style = stylus(str).use(sprite(options));
```

Option | Description | Default
--- | --- | ---
`base_dir` | Base directory | `process.cwd()`
`image_dir` | Image directory | `images`
`cache_dir` | Cache directory | `.stylus_cache`
`base_url` | Base URL | `/`
`image_url` | Image URL | `images`
`layout` | Sprite layout (vertical, horizontal or diagonal) | `vertical`
`spacing` | Spacing between images in sprites | `0`

#### Stylus

``` stylus
icons = sprite-map("icons/*.png")

.cards-club
    sprite(icons, cards-club)
```

### Clean Cache

``` bash
$ rm -rf .stylus_cache
```

## API

### sprite-map(path, [layout=vertical], [spacing=0])

Generates a sprite map.

### sprite-url(map)

Returns the URL of a sprite map.

### sprite-position(map, name, [offset-x=0], [offset-y=0])

Returns the position of an image in a sprite.

### sprite-file(map, name)

Returns a file object in a sprite. A file object contains

- **path**: Relative path of an image
- **x**: Horizontal position of an image in a sprite
- **y**: Vertical position of an image in a sprite
- **width**: Image width
- **height**: Image height

### sprite-file-path(map, name)

Returns the original path of an image in a sprite.

### image-width(path)

Returns the width of an image.

### image-height(path)

Returns the height of an image.

### image-url(path)

Returns the image URL.

### sprite(map, name, [dimensions=false], [offset-x=0], [offset-y=0])

Generates `background` property for an element. For example:

``` stylus
.cards-club
    sprite(icons, cards-club)
```

yields:

``` css
.cards-club {
    background: url("/images/sprite.png") 0px -32px no-repeat;
}
```

### sprite-background-position(map, name, [offset-x=0], [offset-y=0])

Generates `background-position` property for an element. For example:

``` stylus
.cards-club
    sprite-background-position(icons, cards-club)
```

yields:

``` css
.cards-club {
    background-position: 0px -32px;
}
```

### sprite-dimensions(map, name)

Sets the width and the height to the original dimensions of an image. For example:

``` stylus
.cards-club
    sprite-dimensions(icons, cards-club)
```

yields:

``` css
.cards-club {
    width: 32px;
    height: 32px;
}
```

[node-canvas]: https://github.com/LearnBoost/node-canvas
[Cairo]: http://cairographics.org/