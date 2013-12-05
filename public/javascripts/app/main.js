var app = app || {};

app.main = (function(window,document) {
  var _width, _height;
  var _renderer, _scene, _camera;
  var _lightTop;

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

    var cube = new Physijs.BoxMesh(
      new THREE.CubeGeometry(50,50,50),
      new THREE.MeshLambertMaterial({color:0xFF3300})
    );
    cube.position.set(0,200,0);
    cube.castShadow = true;
    cube.rotation.z = Math.PI / 3;

    _scene.add(_lightTop);
    _scene.add(floor);
    _scene.add(cube);
  }

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
      
      requestAnimationFrame(_render);
    }
  }

  return self;
})(this, this.document);

$(document).ready(function() {
  app.main.init();
});