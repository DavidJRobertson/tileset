pixscale  = 6;
tswidth  = 250.5;
tsheight = 400.5;

xoffset   = 0;
yoffset   = 0;
lastX     = 0;
lastY     = 0;
mousedown = false;
spacedown = false;
position  = false;


rendercount = 0;

doc = {
  title: "Example Tileset",
  tilesize: 8,  
  tiles: {
    1: [
      [[10,20,30,40],[255,0,0,80],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40]],
      [[0,0,255,80],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40]],
      [[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40]],
      [[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40]],
      [[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40]],
      [[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40]],
      [[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40]], 
      [[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40],[10,20,30,40]]      
    ], 
    2: [
      [[30,255,60,255],[255,0,0,80],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255]],
      [[0,0,255,80],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255]],
      [[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255]],
      [[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255]],
      [[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255]],
      [[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255]],
      [[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255]], 
      [[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255],[30,255,60,255]]      
    ]
  },
  stage: {
    '-1': {
      '-2': 1
    },
    0: {
      0: 1,
      1: 2,
      2: 1,
      4: 2,
      5: 1
    },
    1: {
      0: 1
    },
    2: {
      1: 1
    },
    3: {
      0: 1
    }
  },
  
  
  
  stageTile: function(x, y, tile) {
    if (!this.stage[x]) {
      this.stage[x] = {};
    }
    this.stage[x][y] = tile;
    redraw();
  },
  unstageTile: function(x, y) {
    if(this.stage[x]) {
      if(this.stage[x][y]) {
        delete this.stage[x][y];
      }
    }
    redraw();
  },
  
  save: function(name) {
    if (!name){
      name = "doc1";
    }
    window.localStorage.setItem(name, JSON.stringify(this));
  },
  load: function(name) {
    if (!name){
      name = "doc1";
    }
    obj = JSON.parse(localStorage.getItem(name));
    if (!obj) {
      return false;
    }
    for(var key in obj) {
      this[key] = obj[key];
    }
    redraw();
    return true;
  }
}


function redraw() {
  var startTime = new Date().getTime();
  
  rendercount++;
  

  
  // Check constraints
  var stagesize = 100 * tileWidth();
  if (xoffset > stagesize)
    xoffset = stagesize;
  if (xoffset < -1 * stagesize)
    xoffset = -1 * stagesize;
  if (yoffset > stagesize)
    yoffset = stagesize;
  if (yoffset < -1 * stagesize)
    yoffset = -1 * stagesize;
    
  
  // Reset canvas and adjust size
  canvas.width  = window.innerWidth - $(".left.bar").width();
  canvas.height = window.innerHeight - $(".top.bar").height();
  
  // Background color
  //cv.fillStyle = "#303239";
  cv.fillStyle = "#fff";
  cv.fillRect(0, 0, canvas.width, canvas.height);
  
  ////////////////////
  // DRAW THE STAGE //
  ////////////////////
  
  // Draw tiles
  $.each(doc.stage, function(x, ar){
    $.each(ar, function(y, t){
      if (t) {
        drawTile(doc.tiles[t], x, y);
      }
    });
  });
  
  // Draw grid
  cv.beginPath();
  cv.strokeStyle = "#888";
  cv.lineWidth = 1;
  if (pixscale >= 3){
    

    var xcoord = xoffset % tileWidth() - tileWidth();
    for (var i = 0; i < canvas.width + tileWidth(); i = i + tileWidth()) {
      xcoord = xcoord + tileWidth();

      cv.moveTo(xcoord + 0.5, 0);
      cv.lineTo(xcoord + 0.5, canvas.height);
    }
    var ycoord = yoffset % tileWidth() - tileWidth();
    for (var i = 0; i < canvas.height + tileWidth(); i = i + tileWidth()) {
      ycoord = ycoord + tileWidth();

      cv.moveTo(0, ycoord + 0.5);
      cv.lineTo(canvas.width, ycoord + 0.5);
    }
  }
  cv.stroke();
  
  // Draw axes
  cv.beginPath();
  cv.strokeStyle = "#f00";
  cv.lineWidth = 1;
  cv.moveTo(xoffset + 0.5, 0);
  cv.lineTo(xoffset + 0.5, canvas.height);
  cv.moveTo(0, yoffset  + 0.5);
  cv.lineTo(canvas.width, yoffset + 0.5);
  cv.stroke();
  
  // Draw tile cursor
  if (position) {
    cv.beginPath();
    cv.strokeStyle = "#000";
    cv.lineWidth = 2;
    
    var initx = position.tile.x * tileWidth() + xoffset;
    var inity = position.tile.y * tileWidth() + yoffset;
    cv.strokeRect(initx, inity, tileWidth(), tileWidth());
  }
  
  
  
  ////////////////////////
  // DRAW THE TILESHEET //
  ////////////////////////
  
  // White box thing
  cv.fillStyle   = "white";
  cv.strokeStyle = "black";
  cv.lineWidth   = 1;
  cv.fillRect(canvas.width - tswidth, canvas.height - tsheight, tswidth, tsheight);
  cv.strokeRect(canvas.width - tswidth, canvas.height - tsheight, tswidth, tsheight);
  
  // Record time/framerate
  var stopTime = new Date().getTime();
  var renderTime = stopTime - startTime;
  var framerate = Math.round(1.0 / (renderTime / 1000));
  $('#framerate').text("Render Time: " + renderTime + "ms");
}

function drawTile(tiledata, gridx, gridy) {
  for (var i=0; i < doc.tilesize; i++) {
    for (var j=0; j < doc.tilesize; j++) {
      var pixel = tiledata[i][j];
      cv.fillStyle = "rgba(" + pixel[0] + ", "+ pixel[1] + ", "+ pixel[2] + ", "+ pixel[3] + ")";
      var x = xoffset + gridx * tileWidth() + j * pixscale;
      var y = yoffset + gridy * tileWidth() + i * pixscale;
      cv.fillRect(x, y, pixscale, pixscale);
    }
  }
}

function getCursorPosition (e) {
  if (typeof e.pageX !== 'undefined' && typeof e.pageY !== 'undefined') {
    var x = e.pageX;
    var y = e.pageY;
  } else {
    var x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    var y = e.clientY + document.body.scrollTop  + document.documentElement.scrollTop;
  }

  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;

  // Absolute (correct for scroll)
  var xa = x - xoffset;
  var ya = y - yoffset;
  
  // Absolute - tile pixel (and for scale)
  var xs = Math.floor(xa / pixscale);
  var ys = Math.floor(ya / pixscale);
  
  // Find tile coord
  var xt = Math.floor(xs / doc.tilesize);
  var yt = Math.floor(ys / doc.tilesize);
  
  // And the pixel within that tile
  var xp = xs % doc.tilesize;
  var yp = ys % doc.tilesize;
  
  coord = {
    tile: {x: xt, y: yt },
    tilepixel: {x: xp , y: yp},
    absolute: {x: xs, y: ys},
    raw: {x: x, y: y}
  };
  
  $('#tilecoord').text('Tile: (' + xt + ',' + yt + ')');
  $('#tilepix').text('Pixel: (' + xp + ',' + yp + ')');
  return coord;
}

function tileWidth(){
  return doc.tilesize * pixscale;
}



$(function() {
  window.canvas = document.getElementById('editcanvas')
  window.cv = canvas.getContext('2d');
  
  redraw();
  xoffset = (canvas.width - tswidth + 0.5) / 2 ;
  yoffset = canvas.height / 2;
  redraw();
  
  $(canvas).mousedown(function(e) { 
    if (e.which == 1) {
      mousedown = true;
      lastX = 0;
      lastY = 0;            
    } else if (e.which == 3) {
      mousedown = true;
    }
  }).mouseup(function(e) {       
    mousedown = false;
  });
  
  $(document).keydown('space', function () {
    spacedown = true;
  }).keyup('space', function () {
    spacedown = false;
  });
  
  $(canvas).mousemove(function(e){
    if (spacedown && mousedown) {
      // Scroll
      var X = e.pageX;
      var Y = e.pageY;
      if (!lastX || !lastY) {
        lastX = X;
        lastY = Y;
      }
      
      xoffset = xoffset - (lastX - X);
      yoffset = yoffset - (lastY - Y);
      
      lastX = X;
      lastY = Y;
      
      redraw();
    } else {
      position = getCursorPosition(e);
      
      redraw();
    }
  });
  
  $(canvas).mousewheel(function (e, delta) {
    e.preventDefault();
    
    var scalemin = 1;
    var scalemax = 100;
    var zoomunit = 1;
    
    if (delta > 0)
      pixscale += zoomunit * Math.sqrt(pixscale);
    else if (delta < 0)
      pixscale -= zoomunit * Math.sqrt(pixscale);
    
    pixscale = Math.round(pixscale);
    if (pixscale < scalemin) { 
      pixscale = scalemin;
    } else if (pixscale > scalemax) {
      pixscale = scalemax;
    } 
         
    xoffset = Math.round(position.raw.x - (position.absolute.x + 0.5) * pixscale);
    yoffset = Math.round(position.raw.y - (position.absolute.y + 0.5) * pixscale); 
    
    //# Make sure cursor stays under mouse
    position = getCursorPosition(e);
    
    redraw();
  });
  
  window.onresize = function(e) {
    position = getCursorPosition(e);
    redraw();
  }
  
  window.oncontextmenu = function() { return false };
  
});

