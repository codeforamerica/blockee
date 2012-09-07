////
// Googlylogo Namespace
////
var Googlylogo = {

  drawLogo: function() {

    var canvas = document.getElementById("logo");
    var ctx = canvas.getContext("2d");
  
    // set up my settings for the face
    var scale = 1;  
    var color = '#1B1918';
    var eyeL = new this.Eye( 15* scale, 15 * scale, 8 * scale, color );
    var eyeR = new this.Eye( 33 * scale, 15 * scale, 8 * scale, color );
    var eyeballL = new this.Eyeball( 15 * scale, 15 * scale, 3 * scale, eyeL.radius - 4 * scale, color );
    var eyeballR = new this.Eyeball( 33 * scale, 15 * scale, 3 * scale, eyeR.radius - 4 * scale, color );

    this.drblockee(ctx);
    

    this.blocklogo(ctx);
    this.glasses(ctx);
      
    ctx.lineWidth = 1 * scale;
    eyeL.paint(ctx);
    eyeR.paint(ctx);
    eyeballL.paint(ctx);
    eyeballR.paint(ctx);

    var that = this;
    
    // let's create a function which redraws the face when mouse moves
    window.addEventListener( 'mousemove', function( ev ){
        
        // when this runs, I should use the event object ev to see new mouse position
        var x = ev.pageX;
        var y = ev.pageY;

         // when this runs, I should update position of eyes
        canvasPos = that.findPos( ctx.canvas );
        eyeballL.canvasX = canvasPos.x;
        eyeballR.canvasX = canvasPos.x;
        eyeballL.canvasY = canvasPos.y;
        eyeballR.canvasY = canvasPos.y;

        // tell the eyeballs to run their follow(x,y) function
        eyeballL.follow( x, y );
        eyeballR.follow( x, y );

        // clear everything
        ctx.clearRect( 0, 0, 50 * scale, 50 * scale );
        // now tell each part to redraw
        
        that.blocklogo(ctx);
        eyeL.paint(ctx);
        eyeR.paint(ctx);
        eyeballL.paint(ctx);
        eyeballR.paint(ctx);
        that.glasses(ctx);

    });
},

// I can create an eye using
// myEye = new Eye( 10, 10, 10, "#f00" );
  Eye: function( x1, y1, r, c ){
    this.radius = r;
    this.x = x1;
    this.y = y1;
    this.color = c;
    // I can use this to call myEye.paint( ctx );
    this.paint = function( ctx ){
      ctx.beginPath();
      ctx.fillStyle = "#FFF";
      ctx.arc( this.x, this.y, this.radius, 0, 2 * Math.PI, true );
   
      ctx.closePath();
      ctx.fill();

   };
},

// similarly I can say myEyeball = new Eyeball(x, y, r, m, c);
  Eyeball: function( x1, y1, r, m, c ){
    this.radius = r;
    this.x = x1;
    this.y = y1;
    this.startX = x1;
    this.startY = y1;
    this.canvasX = 0;
    this.canvasY = 0;
    this.max = m;
    this.color = c;
    // myEyeball.follow( )
    this.follow = function( x1, y1 ){
        if( Math.abs( x1 - this.startX ) > this.max ||  Math.abs( y1 - this.startY ) > this.max ){
             var angle = Math.atan2( y1 - ( this.startY + this.canvasY ) , x1 - ( this.startX + this.canvasX ) );
             var movX = Math.cos( angle ) * this.max;
             var movY = Math.sin( angle ) * this.max;
             this.x = this.startX + movX;
             this.y = this.startY + movY;       
          }  
      };
     // myEyeball.paint(ctx)
     this.paint = function( ctx ){
                ctx.beginPath();
                ctx.arc(this.x,this.y,this.radius, 0, 2*Math.PI,true);
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.closePath();
     };
},

    drblockee: function(ctx) {

       // drblockee/Path
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(1.3, 30.3);
      ctx.lineTo(46.7, 30.3);
      ctx.lineTo(46.7, 0.0);
      ctx.lineTo(1.3, 0.0);
      ctx.lineTo(1.3, 30.3);
      ctx.closePath();
      ctx.fillStyle = "rgb(152, 152, 152)";
      ctx.fill();

      // drblockee/Path
      ctx.beginPath();
      ctx.moveTo(19.3, 15.2);
      ctx.bezierCurveTo(19.3, 19.0, 16.1, 22.1, 12.3, 22.1);
      ctx.bezierCurveTo(8.4, 22.1, 5.3, 19.0, 5.3, 15.2);
      ctx.bezierCurveTo(5.3, 11.3, 8.4, 8.2, 12.3, 8.2);
      ctx.bezierCurveTo(16.1, 8.2, 19.3, 11.3, 19.3, 15.2);
      ctx.closePath();
      ctx.fillStyle = "rgb(252, 253, 253)";
      ctx.fill();

      // drblockee/Path
      ctx.beginPath();
      ctx.moveTo(16.2, 17.2);
      ctx.bezierCurveTo(16.2, 19.3, 14.5, 21.1, 12.3, 21.1);
      ctx.bezierCurveTo(10.1, 21.1, 8.3, 19.3, 8.3, 17.2);
      ctx.bezierCurveTo(8.3, 15.0, 10.1, 13.2, 12.3, 13.2);
      ctx.bezierCurveTo(14.5, 13.2, 16.2, 15.0, 16.2, 17.2);
      ctx.closePath();
      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.fill();

      // drblockee/Path
      ctx.beginPath();
      ctx.moveTo(40.6, 15.2);
      ctx.bezierCurveTo(40.6, 19.0, 37.5, 22.1, 33.6, 22.1);
      ctx.bezierCurveTo(29.8, 22.1, 26.6, 19.0, 26.6, 15.2);
      ctx.bezierCurveTo(26.6, 11.3, 29.8, 8.2, 33.6, 8.2);
      ctx.bezierCurveTo(37.5, 8.2, 40.6, 11.3, 40.6, 15.2);
      ctx.closePath();
      ctx.fillStyle = "rgb(252, 253, 253)";
      ctx.fill();

      // drblockee/Path
      ctx.beginPath();
      ctx.moveTo(36.6, 17.2);
      ctx.bezierCurveTo(36.6, 19.3, 34.8, 21.1, 32.6, 21.1);
      ctx.bezierCurveTo(30.4, 21.1, 28.7, 19.3, 28.7, 17.2);
      ctx.bezierCurveTo(28.7, 15.0, 30.4, 13.2, 32.6, 13.2);
      ctx.bezierCurveTo(34.8, 13.2, 36.6, 15.0, 36.6, 17.2);
      ctx.closePath();
      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.fill();

      // drblockee/Path
      ctx.beginPath();
      ctx.moveTo(19.3, 15.2);
      ctx.bezierCurveTo(19.3, 20.2, 15.2, 24.2, 10.3, 24.2);
      ctx.bezierCurveTo(5.3, 24.2, 1.3, 20.2, 1.3, 15.2);
      ctx.bezierCurveTo(1.3, 10.3, 5.3, 6.2, 10.3, 6.2);
      ctx.bezierCurveTo(15.2, 6.2, 19.3, 10.3, 19.3, 15.2);
      ctx.closePath();
      ctx.lineWidth = 2.6;
      ctx.stroke();

      // drblockee/Path
      ctx.beginPath();
      ctx.moveTo(41.9, 15.2);
      ctx.bezierCurveTo(41.9, 20.2, 37.9, 24.2, 32.9, 24.2);
      ctx.bezierCurveTo(27.9, 24.2, 23.9, 20.2, 23.9, 15.2);
      ctx.bezierCurveTo(23.9, 10.3, 27.9, 6.2, 32.9, 6.2);
      ctx.bezierCurveTo(37.9, 6.2, 41.9, 10.3, 41.9, 15.2);
      ctx.closePath();
      ctx.stroke();

      // drblockee/Path
      ctx.beginPath();
      ctx.moveTo(19.3, 15.2);
      ctx.lineTo(23.6, 15.2);
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // drblockee/Path
      ctx.beginPath();
      ctx.moveTo(41.9, 15.2);
      ctx.lineTo(46.7, 15.2);
      ctx.stroke();

      // drblockee/Group

      // drblockee/Group/Compound Path
      ctx.save();
      ctx.beginPath();

      // drblockee/Group/Compound Path/Path
      ctx.moveTo(70.2, 6.2);
      ctx.lineTo(76.1, 6.2);
      ctx.lineTo(76.1, 24.1);
      ctx.lineTo(70.2, 24.1);
      ctx.lineTo(70.2, 30.0);
      ctx.lineTo(58.3, 30.0);
      ctx.lineTo(58.3, 0.3);
      ctx.lineTo(70.2, 0.3);
      ctx.lineTo(70.2, 6.2);
      ctx.closePath();

      // drblockee/Group/Compound Path/Path
      ctx.moveTo(70.0, 6.2);
      ctx.lineTo(64.3, 6.2);
      ctx.lineTo(64.3, 24.1);
      ctx.lineTo(70.0, 24.1);
      ctx.lineTo(70.0, 6.2);
      ctx.closePath();
      ctx.fillStyle = "rgb(152, 152, 152)";
      ctx.fill();

      // drblockee/Group/Compound Path
      ctx.beginPath();

      // drblockee/Group/Compound Path/Path
      ctx.moveTo(99.9, 30.0);
      ctx.lineTo(94.0, 30.0);
      ctx.lineTo(94.0, 18.1);
      ctx.lineTo(88.0, 18.1);
      ctx.lineTo(88.0, 30.0);
      ctx.lineTo(82.1, 30.0);
      ctx.lineTo(82.1, 0.3);
      ctx.lineTo(99.9, 0.3);
      ctx.lineTo(99.9, 12.2);
      ctx.lineTo(94.0, 12.2);
      ctx.lineTo(94.0, 18.1);
      ctx.lineTo(99.9, 18.1);
      ctx.lineTo(99.9, 30.0);
      ctx.closePath();

      // drblockee/Group/Compound Path/Path
      ctx.moveTo(93.7, 12.2);
      ctx.lineTo(93.7, 6.2);
      ctx.lineTo(88.0, 6.2);
      ctx.lineTo(88.0, 12.2);
      ctx.lineTo(93.7, 12.2);
      ctx.closePath();
      ctx.fill();

      // drblockee/Group/Compound Path
      ctx.beginPath();

      // drblockee/Group/Compound Path/Path
      ctx.moveTo(105.8, 24.1);
      ctx.lineTo(111.8, 24.1);
      ctx.lineTo(111.8, 30.0);
      ctx.lineTo(105.8, 30.0);
      ctx.lineTo(105.8, 24.1);
      ctx.closePath();
      ctx.fill();

      // drblockee/Group
      ctx.restore();

      // drblockee/Group/Group
      ctx.save();

      // drblockee/Group/Group/Compound Path
      ctx.save();
      ctx.beginPath();

      // drblockee/Group/Group/Compound Path/Path
      ctx.moveTo(150.1, 24.3);
      ctx.lineTo(162.2, 24.3);
      ctx.lineTo(162.2, 30.4);
      ctx.lineTo(144.0, 30.4);
      ctx.lineTo(144.0, 0.1);
      ctx.lineTo(150.1, 0.1);
      ctx.lineTo(150.1, 24.3);
      ctx.closePath();
      ctx.fillStyle = "rgb(152, 152, 152)";
      ctx.fill();

      // drblockee/Group/Group/Compound Path
      ctx.beginPath();

      // drblockee/Group/Group/Compound Path/Path
      ctx.moveTo(186.4, 0.1);
      ctx.lineTo(186.4, 30.4);
      ctx.lineTo(168.2, 30.4);
      ctx.lineTo(168.2, 0.1);
      ctx.lineTo(186.4, 0.1);
      ctx.closePath();

      // drblockee/Group/Group/Compound Path/Path
      ctx.moveTo(180.4, 24.3);
      ctx.lineTo(180.4, 6.1);
      ctx.lineTo(174.3, 6.1);
      ctx.lineTo(174.3, 24.3);
      ctx.lineTo(180.4, 24.3);
      ctx.closePath();
      ctx.fill();

      // drblockee/Group/Group/Compound Path
      ctx.beginPath();

      // drblockee/Group/Group/Compound Path/Path
      ctx.moveTo(210.7, 6.1);
      ctx.lineTo(198.5, 6.1);
      ctx.lineTo(198.5, 24.3);
      ctx.lineTo(210.7, 24.3);
      ctx.lineTo(210.7, 30.4);
      ctx.lineTo(192.5, 30.4);
      ctx.lineTo(192.5, 0.1);
      ctx.lineTo(210.7, 0.1);
      ctx.lineTo(210.7, 6.1);
      ctx.closePath();
      ctx.fill();

      // drblockee/Group/Group/Compound Path
      ctx.beginPath();

      // drblockee/Group/Group/Compound Path/Path
      ctx.moveTo(216.7, 0.1);
      ctx.lineTo(222.8, 0.1);
      ctx.lineTo(222.8, 12.2);
      ctx.lineTo(228.9, 12.2);
      ctx.lineTo(228.9, 18.3);
      ctx.lineTo(222.8, 18.3);
      ctx.lineTo(222.8, 30.4);
      ctx.lineTo(216.7, 30.4);
      ctx.lineTo(216.7, 0.1);
      ctx.closePath();

      // drblockee/Group/Group/Compound Path/Path
      ctx.moveTo(228.9, 0.1);
      ctx.lineTo(228.9, 12.2);
      ctx.lineTo(234.9, 12.2);
      ctx.lineTo(234.9, 0.1);
      ctx.lineTo(228.9, 0.1);
      ctx.closePath();

      // drblockee/Group/Group/Compound Path/Path
      ctx.moveTo(234.9, 18.3);
      ctx.lineTo(228.9, 18.3);
      ctx.lineTo(228.9, 30.4);
      ctx.lineTo(234.9, 30.4);
      ctx.lineTo(234.9, 18.3);
      ctx.closePath();
      ctx.fill();

      // drblockee/Group/Group/Compound Path
      ctx.beginPath();

      // drblockee/Group/Group/Compound Path/Path
      ctx.moveTo(259.2, 6.1);
      ctx.lineTo(247.0, 6.1);
      ctx.lineTo(247.0, 12.2);
      ctx.lineTo(253.1, 12.2);
      ctx.lineTo(253.1, 18.3);
      ctx.lineTo(247.0, 18.3);
      ctx.lineTo(247.0, 24.3);
      ctx.lineTo(259.2, 24.3);
      ctx.lineTo(259.2, 30.4);
      ctx.lineTo(241.0, 30.4);
      ctx.lineTo(241.0, 0.1);
      ctx.lineTo(259.2, 0.1);
      ctx.lineTo(259.2, 6.1);
      ctx.closePath();
      ctx.fill();

      // drblockee/Group/Group/Compound Path
      ctx.beginPath();

      // drblockee/Group/Group/Compound Path/Path
      ctx.moveTo(283.4, 6.1);
      ctx.lineTo(271.3, 6.1);
      ctx.lineTo(271.3, 12.2);
      ctx.lineTo(277.4, 12.2);
      ctx.lineTo(277.4, 18.3);
      ctx.lineTo(271.3, 18.3);
      ctx.lineTo(271.3, 24.3);
      ctx.lineTo(283.4, 24.3);
      ctx.lineTo(283.4, 30.4);
      ctx.lineTo(265.2, 30.4);
      ctx.lineTo(265.2, 0.1);
      ctx.lineTo(283.4, 0.1);
      ctx.lineTo(283.4, 6.1);
      ctx.closePath();
      ctx.fill();

      // drblockee/Group/Compound Path
      ctx.restore();
      ctx.beginPath();

      // drblockee/Group/Compound Path/Path
      ctx.moveTo(119.7, 0.1);
      ctx.lineTo(119.7, 30.4);
      ctx.lineTo(137.9, 30.4);
      ctx.lineTo(137.9, 0.1);
      ctx.lineTo(119.7, 0.1);
      ctx.closePath();

      // drblockee/Group/Compound Path/Path
      ctx.moveTo(131.6, 24.3);
      ctx.lineTo(125.8, 24.3);
      ctx.lineTo(125.8, 18.3);
      ctx.lineTo(131.6, 18.3);
      ctx.lineTo(131.6, 24.3);
      ctx.closePath();

      // drblockee/Group/Compound Path/Path
      ctx.moveTo(131.6, 12.2);
      ctx.lineTo(125.8, 12.2);
      ctx.lineTo(125.8, 6.1);
      ctx.lineTo(131.6, 6.1);
      ctx.lineTo(131.6, 12.2);
      ctx.closePath();
      ctx.fillStyle = "rgb(152, 152, 152)";
      ctx.fill();

      // drblockee/Guide
      ctx.restore();

      // drblockee/Guide
      ctx.restore();
    },
    
    glasses: function(ctx) {

      // glasses/Path
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(19.3, 10.3);
      ctx.bezierCurveTo(19.3, 15.2, 15.2, 19.3, 10.3, 19.3);
      ctx.bezierCurveTo(5.3, 19.3, 1.3, 15.2, 1.3, 10.3);
      ctx.bezierCurveTo(1.3, 5.3, 5.3, 1.3, 10.3, 1.3);
      ctx.bezierCurveTo(15.2, 1.3, 19.3, 5.3, 19.3, 10.3);
      ctx.closePath();
      ctx.lineWidth = 2.6;
      ctx.stroke();

      // glasses/Path
      ctx.beginPath();
      ctx.moveTo(41.9, 10.3);
      ctx.bezierCurveTo(41.9, 15.2, 37.9, 19.3, 32.9, 19.3);
      ctx.bezierCurveTo(27.9, 19.3, 23.9, 15.2, 23.9, 10.3);
      ctx.bezierCurveTo(23.9, 5.3, 27.9, 1.3, 32.9, 1.3);
      ctx.bezierCurveTo(37.9, 1.3, 41.9, 5.3, 41.9, 10.3);
      ctx.closePath();
      ctx.stroke();

      // glasses/Path
      ctx.beginPath();
      ctx.moveTo(19.3, 10.2);
      ctx.lineTo(23.6, 10.2);
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // glasses/Path
      ctx.beginPath();
      ctx.moveTo(41.9, 10.3);
      ctx.lineTo(46.7, 10.2);
      ctx.stroke();
      ctx.restore();
    },

  blocklogo: function(ctx) {

  // blocklogo/Path
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0.0, 0.0);
  ctx.lineTo(45.4, 0.0);
  ctx.lineTo(45.4, 30.3);
  ctx.lineTo(0.0, 30.3);
  ctx.lineTo(0.0, 0.0);
  ctx.closePath();
  ctx.fillStyle = "rgb(152, 152, 152)";
  ctx.fill();
  ctx.restore();
},

  findPos: function( el ){
  var left = 0;
  var top = 0;
  do{
    left += el.offsetLeft;
    top += el.offsetTop;
  }while( el = el.offsetParent );
  return { 'x': left, 'y': top };
}
};
