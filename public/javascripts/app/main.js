var app = app || {};

app.main = (function(window,document) {
  var _width, _height;
  var _renderer, _scene, _camera, _newRound = false;
  var _lightTop;
  var _p1 = {}, _p2 = {};
  var _p1score = 0, _p2score = 0, _$p1score, _$p2score;
  var _dudeNumber = 0;
  var _awesomeTimeLength = 300;
  var _awesomeTimer = _awesomeTimeLength;
  var _fightMap, _awesomeMap, _superAwesomeMap, _radMap, _tubeMap, _exMap, _countdown3Map, _countdown2Map, _countdown1Map;
  var _maxAwesomeBlocks = 500;
  var _context;
  var _controlsEnabled = false;

  var _cache = function() {
    _width = window.innerWidth;
    _height = window.innerHeight;

    _context = document.getElementById('c').getContext('2d');

    _fightMap = document.getElementById('fight');
    _awesomeMap = document.getElementById('awesome');
    _superAwesomeMap = document.getElementById('superAwesome');
    _radMap = document.getElementById('radical');
    _tubeMap = document.getElementById('tubular');
    _exMap = document.getElementById('exclaimation');
    _countdown1Map = document.getElementById('countdown1');
    _countdown2Map = document.getElementById('countdown2');
    _countdown3Map = document.getElementById('countdown3');

    _$p1score = $('#p1score h1');
    _$p2score = $('#p2score h1');
    _$p1HitCount = $('#p1hit');
    _$p2HitCount = $('#p2hit');
  }

  var _initPhysiJS = function() {
    Physijs.scripts.worker = '/javascripts/plugins/physijs_worker.js';
    Physijs.scripts.ammo = '/javascripts/plugins/ammo.js';
  };

  var _initThree = function() {
    _camera = new THREE.PerspectiveCamera(45, _width/_height, 0.1, 10000);
    _camera.position.set(0,300,-500);
    _camera.lookAt(new THREE.Vector3(0,0,0));

    _renderer = new THREE.WebGLRenderer();
    _renderer.setSize(_width, _height);
    _renderer.shadowMapEnabled = true;
    _renderer.shadowCameraNear = 3;
    _renderer.shadowCameraFar = _camera.far;
    _renderer.shadowCameraFov = 50;
    _renderer.shadowMapBias = 0.0039;
    _renderer.shadowMapDarkness = 0.5;
    _renderer.shadowMapWidth = 1024;
    _renderer.shadowMapHeight = 1024;

    _scene = new Physijs.Scene;
    _scene.setGravity(new THREE.Vector3(0,-100,0));
    _scene.add(_camera);
    
    $('#container').append(_renderer.domElement);
  };

  var _fillScene = function() {
    _lightTop = new THREE.DirectionalLight(0xFFFFFF, 1);
    _lightTop.position.set(0,500,-300);
    _lightTop.castShadow = true;

    var floor = new Physijs.BoxMesh(
      new THREE.CubeGeometry(500,10,500),
      new THREE.MeshLambertMaterial({color:0xEFEFEF}),
      0
    );
    //floor.rotation.x = .1;
    floor.receiveShadow = true;

    _makeDude(_p1, 0xFF3300, new THREE.Vector3(150,200,0));
    _makeDude(_p2, 0x0033FF, new THREE.Vector3(-150,200,0));

    _scene.add(_lightTop);
    _scene.add(floor);
  }

  var _makeDude = function(player, color, position) {
    _dudeNumber++;

    player.startPosition = position;
    player.awesomeLevel = 1;
    player.awesomeBool = true;

    player.body = new Physijs.BoxMesh(
      new THREE.CubeGeometry(20,100,50),
      new THREE.MeshLambertMaterial({color:color})
    );
    player.body.position.set(position.x, position.y, position.z);
    player.body.castShadow = true;
    player.body.hitCounter = 0;
    player.body.name = _dudeNumber;

    player.frontArm = new Physijs.BoxMesh(
      new THREE.CubeGeometry(10,60,10),
      new THREE.MeshLambertMaterial({color:color})
    );
    player.frontArm.position.set(player.body.position.x, player.body.position.y, player.body.position.z + 35)
    player.frontArm.castShadow = true;
    player.frontArm.name = _dudeNumber;
    player.frontArm.isArm = true;

    player.frontArm.awesomePunchesLanded = 0;

    player.rearArm = new Physijs.BoxMesh(
      new THREE.CubeGeometry(10,60,10),
      new THREE.MeshLambertMaterial({color:color})
    );
    player.rearArm.position.set(player.body.position.x, player.body.position.y, player.body.position.z - 35)
    player.rearArm.castShadow = true;
    player.rearArm.name = _dudeNumber;
    player.rearArm.isArm = true;


    player.rearArm.awesomePunchesLanded = 0;

    player.body.addEventListener( 'collision', handleCollision );

    _scene.add(player.body);
    _scene.add(player.frontArm);
    _scene.add(player.rearArm);

    player.frontConstraint = new Physijs.ConeTwistConstraint(
      player.body,
      player.frontArm,
      new THREE.Vector3(player.body.position.x, player.body.position.y + 30, player.body.position.z + 35)
    );

    player.rearConstraint = new Physijs.ConeTwistConstraint(
      player.body,
      player.rearArm,
      new THREE.Vector3(player.body.position.x, player.body.position.y + 30, player.body.position.z - 35)
    );

    _scene.addConstraint(player.frontConstraint);
    _scene.addConstraint(player.rearConstraint);

    player.frontConstraint.setMaxMotorImpulse(50);
    player.rearConstraint.setMaxMotorImpulse(50);
  };

  var _activateMotor = function(constraint, target) {
    constraint.setMotorTarget(target);
    constraint.enableMotor();
  };

  var _applyImpulse = function(object, target) {
    var force = target.clone().sub(object.position).normalize().multiplyScalar(2000);
    object.setLinearVelocity(force);
  };

  var handleCollision = function(collided_with, linearVelocity, angularVelocity) {

    if(this.name != collided_with.name && collided_with.isArm){//collided_with.name != "" && collided_with.name != "rain" && collided_with.name != "awesomeText" ){
      this.hitCounter++;
    }

  }

  var _addListeners = function() {
    $(window).keydown(function(e) {
      if(_controlsEnabled) {
        switch(e.keyCode) {
          case 65: //a
            //_activateMotor(_p1.frontConstraint, _p2.body.position);
            _applyImpulse(_p1.frontArm, _p2.frontArm.position);
            break;
          case 81: //q
            //_activateMotor(_p1.rearConstraint, _p2.body.position);
            _applyImpulse(_p1.rearArm, _p2.rearArm.position);
            break;
          case 76: //l
            //_activateMotor(_p2.frontConstraint, _p1.body.position);
            _applyImpulse(_p2.frontArm, _p1.frontArm.position);
            break;
          case 79: //o
            //_activateMotor(_p2.rearConstraint, _p1.body.position);
            _applyImpulse(_p2.rearArm, _p1.rearArm.position);
            break;
          case 82:
            _makeItRain();
            break;
        }
      }
    });
  };

  var _checkBounds = function() {
    var p1y = _p1.body.position.y;
    var p2y = _p2.body.position.y;

    var p1out = false, p2out = false;

    if(p1y < -10) {
      p1out = true;
      _p2score++;
    }
    
    if(p2y < -10) {
      p2out = true;
      _p1score++;
    }

    _updateScores();
    if(p1out || p2out) _resetGame();
  };

  var _updateScores = function() {
    _$p1score.text(_p1score);
    _$p2score.text(_p2score);
    _$p1HitCount.text("Hit Count: "+_p2.body.hitCounter);
    _$p2HitCount.text("Hit Count: "+_p1.body.hitCounter);
  };

  var _resetGame = function() {
    _newRound = true;

    _resetPlayer(_p1);
    _resetPlayer(_p2);
  };

  var _howAwesome = function(player, player2) {
      if((player2.body.hitCounter)/20 > player.awesomeLevel){
        player.awesomeLevel++;
        player.awesomeBool = true;
      }

      if(player.awesomeBool){
        switch (player.awesomeLevel){
          case 2:
            _textToBlocks(player, _awesomeMap);
            break;
          case 3: 
            _textToBlocks(player, _exMap);
            break;
          case 4: 
            _textToBlocks(player, _radMap);
            break;
          case 5: 
            _textToBlocks(player, _tubeMap);
            break;
          case 6: 
            _textToBlocks(player, _superAwesomeMap);
            break;
        }
        player.awesomeBool = false;
        _awesomeTimer = _awesomeTimeLength;
    }
  }

  var _textToBlocks = function(player, map){

    _context.width = map.width;
    _context.height = map.height;

    _context.drawImage(map, 0, 0, map.width, map.height);

    var position = player.body.position.clone();
    position.y+=60;
    position.x-=(map.width/2)*10;

    for(var x = 0; x<map.width; x++){
    for(var y = 0; y<map.height; y++){
      var imgData = _context.getImageData(x, y, 1, 1);
      if(imgData.data[0] > 0){
        
      var pixel = new Physijs.BoxMesh(
        new THREE.CubeGeometry(10,10,10),
        player.body.material
      );

     pixel.name = "awesomeText";
     pixel.receiveShadow = true;
     pixel.castShadow = true;
     pixel.position.set(position.x+((map.width-x)*10),position.y+((map.height-y)*10),position.z);
     _scene.add(pixel);

      }
    }
  }

  }

  var _resetPlayer = function(player) {
    player.body.position.set(player.startPosition.x, player.startPosition.y, player.startPosition.z);
    player.frontArm.position.set(player.startPosition.x, player.startPosition.y + 30, player.startPosition.z + 35);
    player.rearArm.position.set(player.startPosition.x, player.startPosition.y + 30, player.startPosition.z - 35);
    
    player.body.hitCounter = 0;
    player.awesomeLevel = 1;
    player.frontArm.awesomePunchesLanded = 0;
    player.rearArm.awesomePunchesLanded = 0;

    player.body.rotation = new THREE.Euler(0,0,0,'XYZ');
    player.frontArm.rotation = new THREE.Euler(0,0,0,'XYZ');
    player.rearArm.rotation = new THREE.Euler(0,0,0,'XYZ');
    
    player.body.setAngularFactor(new THREE.Vector3(0,0,0));
    player.body.setLinearFactor(new THREE.Vector3(0,0,0));

    player.frontArm.setAngularFactor(new THREE.Vector3(0,0,0));
    player.frontArm.setLinearFactor(new THREE.Vector3(0,0,0));

    player.rearArm.setAngularFactor(new THREE.Vector3(0,0,0));
    player.rearArm.setLinearFactor(new THREE.Vector3(0,0,0));

    player.body.setAngularVelocity(new THREE.Vector3(0,0,0));
    player.body.setLinearVelocity(new THREE.Vector3(0,0,0));

    player.frontArm.setAngularVelocity(new THREE.Vector3(0,0,0));
    player.frontArm.setLinearVelocity(new THREE.Vector3(0,0,0));

    player.rearArm.setAngularVelocity(new THREE.Vector3(0,0,0));
    player.rearArm.setLinearVelocity(new THREE.Vector3(0,0,0));

    player.body.__dirtyPosition = true;
    player.body.__dirtyRotation = true;

    player.frontArm.__dirtyPosition = true;
    player.frontArm.__dirtyRotation = true;

    player.rearArm.__dirtyPosition = true;
    player.rearArm.__dirtyRotation = true;
  }

  var _enablePlayer = function(player) {
    player.body.__dirtyPosition = false;
    player.body.__dirtyRotation = false;

    player.frontArm.__dirtyPosition = false;
    player.frontArm.__dirtyRotation = false;

    player.rearArm.__dirtyPosition = false;
    player.rearArm.__dirtyRotation = false;

    player.body.setAngularFactor(new THREE.Vector3(1,1,1));
    player.body.setLinearFactor(new THREE.Vector3(1,1,1));

    player.frontArm.setAngularFactor(new THREE.Vector3(1,1,1));
    player.frontArm.setLinearFactor(new THREE.Vector3(1,1,1));

    player.rearArm.setAngularFactor(new THREE.Vector3(1,1,1));
    player.rearArm.setLinearFactor(new THREE.Vector3(1,1,1));
  };

  var _makeItRain = function(){

  for(var i=0;i<20;i++){
    var rain = new Physijs.BoxMesh(
      new THREE.CubeGeometry(10,10,10),
      new THREE.MeshLambertMaterial({color:0xffffff})
    );
    rain.name = "rain";
    rain.receiveShadow = true;
    rain.position.set(i,50,0);

    _scene.add(rain);
  }

  }

  // var _getAveragePointOfInterest = function(){

  //   var avg = new THREE.Vector3(0,0,0);
  //   avg.add(_p1.position);
  //   avg.add(_p2.position);
  //   avg.divideScalar(2);
  //   return avg;

  // }

  // var _setCam = function(POI){
  //   _camera.lookAt(POI);
  // }

  var _removeTheFallen = function(){

    var numAwesomes = 0;
   for(var i=0;i<_scene.children.length;i++){
      if(_scene.children[i].name == "awesomeText")numAwesomes++;
      if( _scene.children[i].position.y < -100 && _scene.children[i].name == "awesomeText" )_scene.remove(_scene.children[i]);
    }
    console.log(numAwesomes);
    if(numAwesomes>_maxAwesomeBlocks){
      for(var i=0;i<_scene.children.length;i++){
        if(_scene.children[i].name == "awesomeText"){
          if(numAwesomes>_maxAwesomeBlocks){
          _scene.remove(_scene.children[i]);
          numAwesomes--;
        }else{
          break;
        }
        }
      }
    }
        console.log(numAwesomes);


  }

  var _beginCountdown = function() {
    var maps = [_fightMap, _countdown1Map, _countdown2Map, _countdown3Map];
    var count = 3;

    var countdownInterval = setInterval(function() {
      _textToBlocks(_p1, maps[count]);
      _textToBlocks(_p2, maps[count]);

      if(count == 0) {
        clearInterval(countdownInterval);
        _controlsEnabled = true;
      }
      else
        count--;
    }, 2000);
  }

  var _render = function() {
    if(_newRound) {
      _enablePlayer(_p1);
      _enablePlayer(_p2);

      _newRound = false;
    }

    _howAwesome(_p1, _p2);
    _howAwesome(_p2, _p1);
    _removeTheFallen();
    _checkBounds();

    _awesomeTimer--;
    if(_awesomeTimer<0)_awesomeTimer=0;

    _scene.simulate();
    _renderer.render(_scene, _camera);
    requestAnimationFrame(_render);
  };

  var self = {
    init: function() {
      _cache();
      _initPhysiJS();
      _initThree();
      _fillScene();
      _addListeners();
      
      setTimeout(_beginCountdown, 2000);
      
      requestAnimationFrame(_render);
    }
  }

  return self;
})(this, this.document);

$(document).ready(function() {
  app.main.init();
});