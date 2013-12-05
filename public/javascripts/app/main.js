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
    _scene.setGravity(new THREE.Vector3(0,-50,0));
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

    _makeDude();

    _scene.add(_lightTop);
    _scene.add(floor);
  }

  var _makeDude = function() {
    _p1.body = new Physijs.BoxMesh(
      new THREE.CubeGeometry(20,100,50),
      new THREE.MeshLambertMaterial({color:0xFF3300})
    );
    _p1.body.position.set(-150,200,0);
    _p1.body.castShadow = true;

    _p1.arm = new Physijs.BoxMesh(
      new THREE.CubeGeometry(10,60,10),
      new THREE.MeshLambertMaterial({color:0xFF3300})
    );
    _p1.arm.position.set(_p1.body.position.x, _p1.body.position.y, _p1.body.position.z + 30)
    _p1.arm.castShadow = true;

    _p1.constraint = new Physijs.ConeTwistConstraint(
      _p1.body,
      _p1.arm,
      new THREE.Vector3(_p1.body.position.x, _p1.body.position.y, _p1.body.position.z + 30)
    );

    _scene.add(_p1.body);
    _scene.add(_p1.arm);
    _scene.addConstraint(_p1.constraint);
  };

  var _addListeners = function() {

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