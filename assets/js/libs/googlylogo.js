
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
    var eyeL = new this.Eye( 15 * scale, 15 * scale, 8 * scale, color );
    var eyeR = new this.Eye( 33 * scale, 15 * scale, 8 * scale, color );
    var eyeballL = new this.Eyeball( 15 * scale, 15 * scale, 3 * scale, eyeL.radius - 4 * scale, color );
    var eyeballR = new this.Eyeball( 33 * scale, 15 * scale, 3 * scale, eyeR.radius - 4 * scale, color );

    this.blockee(ctx);

    this.blocklogo(ctx);
    
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

  blockee: function(ctx) {

  // blockee/Group
  ctx.save();

  // blockee/Group/Path
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(83.6, 24.4);
  ctx.lineTo(95.7, 24.4);
  ctx.lineTo(95.7, 30.5);
  ctx.lineTo(77.5, 30.5);
  ctx.lineTo(77.5, 0.2);
  ctx.lineTo(83.6, 0.2);
  ctx.lineTo(83.6, 24.4);
  ctx.closePath();
  ctx.fillStyle = "rgb(152, 152, 152)";
  ctx.fill();

  // blockee/Group/Compound Path
  ctx.beginPath();

  // blockee/Group/Compound Path/Path
  ctx.moveTo(119.9, 0.2);
  ctx.lineTo(119.9, 30.5);
  ctx.lineTo(101.8, 30.5);
  ctx.lineTo(101.8, 0.2);
  ctx.lineTo(119.9, 0.2);
  ctx.closePath();

  // blockee/Group/Compound Path/Path
  ctx.moveTo(113.9, 24.4);
  ctx.lineTo(113.9, 6.2);
  ctx.lineTo(107.8, 6.2);
  ctx.lineTo(107.8, 24.4);
  ctx.lineTo(113.9, 24.4);
  ctx.lineTo(113.9, 24.4);
  ctx.closePath();
  ctx.fill();

  // blockee/Group/Path
  ctx.beginPath();
  ctx.moveTo(144.2, 6.2);
  ctx.lineTo(132.1, 6.2);
  ctx.lineTo(132.1, 24.4);
  ctx.lineTo(144.2, 24.4);
  ctx.lineTo(144.2, 30.5);
  ctx.lineTo(126.0, 30.5);
  ctx.lineTo(126.0, 0.2);
  ctx.lineTo(144.2, 0.2);
  ctx.lineTo(144.2, 6.2);
  ctx.closePath();
  ctx.fill();

  // blockee/Group/Compound Path
  ctx.beginPath();

  // blockee/Group/Compound Path/Path
  ctx.moveTo(150.3, 0.2);
  ctx.lineTo(156.3, 0.2);
  ctx.lineTo(156.3, 12.3);
  ctx.lineTo(162.4, 12.3);
  ctx.lineTo(162.4, 18.3);
  ctx.lineTo(156.3, 18.3);
  ctx.lineTo(156.3, 30.5);
  ctx.lineTo(150.3, 30.5);
  ctx.lineTo(150.3, 0.2);
  ctx.closePath();

  // blockee/Group/Compound Path/Path
  ctx.moveTo(162.4, 0.2);
  ctx.lineTo(162.4, 12.3);
  ctx.lineTo(168.4, 12.3);
  ctx.lineTo(168.4, 0.2);
  ctx.lineTo(162.4, 0.2);
  ctx.closePath();

  // blockee/Group/Compound Path/Path
  ctx.moveTo(168.4, 18.3);
  ctx.lineTo(162.4, 18.3);
  ctx.lineTo(162.4, 30.5);
  ctx.lineTo(168.4, 30.5);
  ctx.lineTo(168.4, 18.3);
  ctx.closePath();
  ctx.fill();

  // blockee/Group/Path
  ctx.beginPath();
  ctx.moveTo(192.7, 6.2);
  ctx.lineTo(180.6, 6.2);
  ctx.lineTo(180.6, 12.3);
  ctx.lineTo(186.6, 12.3);
  ctx.lineTo(186.6, 18.3);
  ctx.lineTo(180.6, 18.3);
  ctx.lineTo(180.6, 24.4);
  ctx.lineTo(192.7, 24.4);
  ctx.lineTo(192.7, 30.5);
  ctx.lineTo(174.5, 30.5);
  ctx.lineTo(174.5, 0.2);
  ctx.lineTo(192.7, 0.2);
  ctx.lineTo(192.7, 6.2);
  ctx.closePath();
  ctx.fill();

  // blockee/Group/Path
  ctx.beginPath();
  ctx.moveTo(216.9, 6.2);
  ctx.lineTo(204.8, 6.2);
  ctx.lineTo(204.8, 12.3);
  ctx.lineTo(210.9, 12.3);
  ctx.lineTo(210.9, 18.3);
  ctx.lineTo(204.8, 18.3);
  ctx.lineTo(204.8, 24.4);
  ctx.lineTo(216.9, 24.4);
  ctx.lineTo(216.9, 30.5);
  ctx.lineTo(198.7, 30.5);
  ctx.lineTo(198.7, 0.2);
  ctx.lineTo(216.9, 0.2);
  ctx.lineTo(216.9, 6.2);
  ctx.closePath();
  ctx.fill();

  // blockee/Compound Path
  ctx.restore();
  ctx.beginPath();

  // blockee/Compound Path/Path
  ctx.moveTo(53.3, 0.2);
  ctx.lineTo(53.3, 30.5);
  ctx.lineTo(71.4, 30.5);
  ctx.lineTo(71.4, 0.2);
  ctx.lineTo(53.3, 0.2);
  ctx.closePath();

  // blockee/Compound Path/Path
  ctx.moveTo(65.1, 24.4);
  ctx.lineTo(59.3, 24.4);
  ctx.lineTo(59.3, 18.3);
  ctx.lineTo(65.1, 18.3);
  ctx.lineTo(65.1, 24.4);
  ctx.closePath();

  // blockee/Compound Path/Path
  ctx.moveTo(65.1, 12.3);
  ctx.lineTo(59.3, 12.3);
  ctx.lineTo(59.3, 6.2);
  ctx.lineTo(65.1, 6.2);
  ctx.lineTo(65.1, 12.3);
  ctx.closePath();
  ctx.fillStyle = "rgb(152, 152, 152)";
  ctx.fill();
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
