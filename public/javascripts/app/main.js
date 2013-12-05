var app = app || {};

app.main = (function(window,document) {
  var _width, _height;
  var _renderer, _scene, _camera;
  var _lightTop;
  var _p1 = {}, _p2 = {};

  var _cacheBrowserVariables = function() {
    _width = window.innerWidth;
    _height = window.innerHeight;
  }

  var _initPhysiJS = function() {
    Physijs.scripts.worker = '/javascripts/plugins/physijs_worker.js';
    Physijs.scripts.ammo = '/javascripts/plugins/ammo.js';
  };

  var _initThree = function() {
    _camera = new THREE.PerspectiveCamera(45, _width/_height, 0.1, 10000);
    _camera.position.set(0,300,500);
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
    _lightTop.position.set(0,500,300);
    _lightTop.castShadow = true;

    var floor = new Physijs.BoxMesh(
      new THREE.CubeGeometry(500,10,500),
      new THREE.MeshLambertMaterial({color:0xEFEFEF}),
      0
    );
    floor.receiveShadow = true;

    _makeDude(_p1, 0xFF3300, new THREE.Vector3(-150,200,0));
    _makeDude(_p2, 0x0033FF, new THREE.Vector3(150,200,0));

    _scene.add(_lightTop);
    _scene.add(floor);
  }

  var _makeDude = function(player, color, position) {
    player.body = new Physijs.BoxMesh(
      new THREE.CubeGeometry(20,100,50),
      new THREE.MeshLambertMaterial({color:color})
    );
    player.body.position.set(position.x, position.y, position.z);
    player.body.castShadow = true;

    player.frontArm = new Physijs.BoxMesh(
      new THREE.CubeGeometry(10,60,10),
      new THREE.MeshLambertMaterial({color:color})
    );
    player.frontArm.position.set(player.body.position.x, player.body.position.y, player.body.position.z + 35)
    player.frontArm.castShadow = true;

    player.rearArm = new Physijs.BoxMesh(
      new THREE.CubeGeometry(10,60,10),
      new THREE.MeshLambertMaterial({color:color})
    );
    player.rearArm.position.set(player.body.position.x, player.body.position.y, player.body.position.z - 35)
    player.rearArm.castShadow = true;

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

  var _addListeners = function() {
    $(window).keydown(function(e) {
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
      }
    });

    $(window).keyup(function(e) {
      switch(e.keyCode) {
        case 65: //a
          _p1.frontConstraint.disableMotor();
          break;
        case 81: //q
          _p1.rearConstraint.disableMotor();
          break;
        case 76: //l
          _p2.frontConstraint.disableMotor();
          break;
        case 79: //o
          _p2.rearConstraint.disableMotor();
          break;
      }
    });
  };

  var _render = function() {
    _scene.simulate();
    _renderer.render(_scene, _camera);
    requestAnimationFrame(_render);
  };

  var self = {
    init: function() {
      _cacheBrowserVariables();
      _initPhysiJS();
      _initThree();
      _fillScene();
      _addListeners();
      
      requestAnimationFrame(_render);
    }
  }

  return self;
})(this, this.document);

$(document).ready(function() {
  app.main.init();
});