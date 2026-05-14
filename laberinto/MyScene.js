
// Clases de la biblioteca

import * as THREE from 'three'
import { GUI } from 'gui'
import { PointerLockControls } from 'pointerlock'

// Clases de mi proyecto

import { Laberinto } from './Laberinto.js'
import { Bosque } from './Bosque.js'
import { Mosca } from '../pick-ups/mosca/Mosca.js'
import { Llave } from '../pick-ups/llave/Llave.js'
import { Bota } from '../pick-ups/bota/Bota.js'
import { Nenufar } from '../pick-ups/nenufar/Nenufar.js'


/// La clase fachada del modelo
/**
 * Usaremos una clase derivada de la clase Scene de Three.js para llevar el control de la escena y de todo lo que ocurre en ella.
 */

class MyScene extends THREE.Scene {
  // Recibe el  div  que se ha creado en el  html  que va a ser el lienzo en el que mostrar
  // la visualización de la escena
  constructor(myCanvas) {
    super();

    // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
    this.renderer = this.createRenderer(myCanvas);

    // Variables globales de la escena para los objetos recogidos
    // (Se deben definir ANTES de createGUI para que dat.gui pueda leerlas)
    this.mosca_picked = false;
    this.llave_picked = false;
    this.bota_picked = false;
    this.nenufar_picked = false;

    this.clock = new THREE.Clock();


    // Se crea la interfaz gráfica de usuario
    this.gui = this.createGUI();

    // Construimos los distinos elementos que tendremos en la escena

    // Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
    // Tras crear cada elemento se añadirá a la escena con   this.add(variable)
    this.createLights();

    // Tendremos una cámara con un control de movimiento con el ratón
    this.createCamera();

    // Un suelo (ahora con el tamaño estático de 42x22 porque la cuadrícula es de 2.0)
    this.createGround(42, 22);

    // Y unos ejes. Imprescindibles para orientarnos sobre dónde están las cosas
    // Todas las unidades están en metros
    this.axis = new THREE.AxesHelper(0.1);
    this.add(this.axis);


    // Por último creamos el modelo.
    // Le pasamos una variable de sincronizacion
    var laberintoCargado = $.Deferred();
    this.laberinto = new Laberinto("./laberinto.txt", laberintoCargado);
    this.add(this.laberinto);

    var bosqueCargado = $.Deferred();
    this.bosque = new Bosque("./laberinto.txt", bosqueCargado);
    this.add(this.bosque);

    $.when(laberintoCargado, bosqueCargado).done(() => {
      console.log("Este bloque no se ejecuta hasta que se resuelven las variables de sincronización");

      this.pickUps = [];

      const colocar = (letra, objeto, altura) => {
        if (this.laberinto.posiciones[letra]) {
          const pos = this.laberinto.posiciones[letra];
          this.add(objeto);
          this.laberinto.getMundoFromCelda(pos.fila, pos.columna, objeto.position);
          objeto.position.y = altura;
          this.pickUps.push(objeto);
          return objeto;
        }
        return null;
      };

      // 1. Mosca 
      this.moscaItem = colocar(Laberinto.MOSCA, new Mosca(null, "Mosca"), 0.5);

      // 2. Llave 
      colocar(Laberinto.LLAVE, new Llave(null, "Llave"), 0.1);

      // 3. Bota 
      colocar(Laberinto.BOTA, new Bota(null, "Bota"), 0.1);

      // 4. Nenufar 
      colocar(Laberinto.NENUFAR, new Nenufar(null, "Nenufar"), 0.1); // A ras de suelo

      // Jugador
      if (this.laberinto.posiciones[Laberinto.PLAYER]) {
        const posY = this.laberinto.posiciones[Laberinto.PLAYER];
        const camPos = new THREE.Vector3();
        this.laberinto.getMundoFromCelda(posY.fila, posY.columna, camPos);
        this.camera.position.set(camPos.x, 0.4, camPos.z);
      }
    });
  }

  createCamera() {

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100);
    // Posición inicial de la cámara (el jugador). Más bajito para que el bosque parezca más grande
    this.camera.position.set(0, 0.4, 0);

    this.cameraControl = new PointerLockControls(this.camera, this.renderer.domElement);

    document.addEventListener('click', (event) => {
      if (!this.cameraControl.isLocked) {
        const picked = this.checkPickupClick(event);
        if (!picked) {
          this.cameraControl.lock();
        }
      }
    });

    // Variables para el movimiento WASD
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    const onKeyDown = (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW': this.moveForward = true; break;
        case 'ArrowLeft':
        case 'KeyA': this.moveLeft = true; break;
        case 'ArrowDown':
        case 'KeyS': this.moveBackward = true; break;
        case 'ArrowRight':
        case 'KeyD': this.moveRight = true; break;
      }
    };

    const onKeyUp = (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW': this.moveForward = false; break;
        case 'ArrowLeft':
        case 'KeyA': this.moveLeft = false; break;
        case 'ArrowDown':
        case 'KeyS': this.moveBackward = false; break;
        case 'ArrowRight':
        case 'KeyD': this.moveRight = false; break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
  }

  createGround(width, depth) {
    // El suelo es un Mesh, necesita una geometría y un material.

    // La geometría es una caja con muy poca altura
    var geometryGround = new THREE.BoxGeometry(width, 0.02, depth);

    // El material se hará con una textura de madera
    var texture = new THREE.TextureLoader().load('../imgs/grass.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(width, depth);
    var materialGround = new THREE.MeshStandardMaterial({ map: texture });

    // Ya se puede construir el Mesh
    var ground = new THREE.Mesh(geometryGround, materialGround);

    // Todas las figuras se crean centradas en el origen.
    // El suelo lo bajamos la mitad de su altura para que el origen del mundo se quede en su lado superior
    ground.position.y = -0.01;

    // Que no se nos olvide añadirlo a la escena, que en este caso es  this
    this.add(ground);
  }

  createGUI() {
    // Se crea la interfaz gráfica de usuario
    var gui = new GUI();

    // La escena le va a añadir sus propios controles. 
    // Se definen mediante un objeto de control
    // En este caso la intensidad de la luz y si se muestran o no los ejes
    this.guiControls = {
      // En el contexto de una función   this   alude a la función
      lightPower: 500.0,  // La potencia de esta fuente de luz se mide en lúmenes
      ambientIntensity: 0.5,
      axisOnOff: true
    }

    var folder = gui.addFolder('Luz y Ejes');

    // Se le añade un control para la potencia de la luz puntual
    folder.add(this.guiControls, 'lightPower', 0, 1000, 20)
      .name('Luz puntual : ')
      .onChange((value) => this.setLightPower(value));

    // Otro para la intensidad de la luz ambiental
    folder.add(this.guiControls, 'ambientIntensity', 0, 1, 0.05)
      .name('Luz ambiental: ')
      .onChange((value) => this.setAmbientIntensity(value));

    // Y otro para mostrar u ocultar los ejes
    folder.add(this.guiControls, 'axisOnOff')
      .name('Mostrar ejes : ')
      .onChange((value) => this.setAxisVisible(value));

    // Nueva sección para mostrar el inventario
    var inventarioFolder = gui.addFolder('Inventario');

    inventarioFolder.add(this, 'mosca_picked').name('Mosca').listen();
    inventarioFolder.add(this, 'llave_picked').name('Llave').listen();
    inventarioFolder.add(this, 'bota_picked').name('Bota').listen();
    inventarioFolder.add(this, 'nenufar_picked').name('Nenúfar').listen();

    return gui;
  }

  createLights() {
    // Se crea una luz ambiental, evita que se vean complentamente negras las zonas donde no incide de manera directa una fuente de luz
    // La luz ambiental solo tiene un color y una intensidad
    // Se declara como   var   y va a ser una variable local a este método
    //    se hace así puesto que no va a ser accedida desde otros métodos
    this.ambientLight = new THREE.AmbientLight('white', this.guiControls.ambientIntensity);
    // La añadimos a la escena
    this.add(this.ambientLight);

    // Se crea una luz focal que va a ser la luz principal de la escena
    // La luz focal, además tiene una posición, y un punto de mira
    // Si no se le da punto de mira, apuntará al (0,0,0) en coordenadas del mundo
    // En este caso se declara como   this.atributo   para que sea un atributo accesible desde otros métodos.
    this.pointLight = new THREE.SpotLight(0xffffff);
    this.pointLight.power = this.guiControls.lightPower;
    this.pointLight.position.set(2, 9, 1);
    console.log(this.pointLight);
    this.add(this.pointLight);
  }

  setLightPower(valor) {
    this.pointLight.power = valor;
  }

  setAmbientIntensity(valor) {
    this.ambientLight.intensity = valor;
  }

  setAxisVisible(valor) {
    this.axis.visible = valor;
  }

  createRenderer(myCanvas) {
    // Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.

    // Se instancia un Renderer   WebGL
    var renderer = new THREE.WebGLRenderer();

    // Se establece un color de fondo en las imágenes que genera el render
    renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);

    // Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
    renderer.setSize(window.innerWidth, window.innerHeight);

    // La visualización se muestra en el lienzo recibido
    $(myCanvas).append(renderer.domElement);

    return renderer;
  }

  getCamera() {
    // En principio se devuelve la única cámara que tenemos
    // Si hubiera varias cámaras, este método decidiría qué cámara devuelve cada vez que es consultado
    return this.camera;
  }

  setCameraAspect(ratio) {
    // Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
    // su sistema operativo hay que actualizar el ratio de aspecto de la cámara
    this.camera.aspect = ratio;
    // Y si se cambia ese dato hay que actualizar la matriz de proyección de la cámara
    this.camera.updateProjectionMatrix();
  }

  onWindowResize() {
    // Este método es llamado cada vez que el usuario modifica el tamapo de la ventana de la aplicación
    // Hay que actualizar el ratio de aspecto de la cámara
    this.setCameraAspect(window.innerWidth / window.innerHeight);

    // Y también el tamaño del renderizador
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  update() {
    this.renderer.render(this, this.getCamera());

    const delta = this.clock.getDelta();

    if (this.cameraControl.isLocked === true) {

      this.velocity.x -= this.velocity.x * 10.0 * delta;
      this.velocity.z -= this.velocity.z * 10.0 * delta;

      this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
      this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
      this.direction.normalize(); //Para que corra igual en diagonal que en recta

      const speed = 15.0;
      if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * speed * delta;
      if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * speed * delta;

      if (!this.raycaster) this.raycaster = new THREE.Raycaster();
      const radioJugador = 0.2;

      // 1. Aplicar movimiento lateral y comprobar colisiones
      if (Math.abs(this.velocity.x) > 0.0001) {
        const posAntesX = this.camera.position.clone();
        this.cameraControl.moveRight(-this.velocity.x * delta);
        const movX = new THREE.Vector3().subVectors(this.camera.position, posAntesX);

        if (movX.length() > 0.0001) {
          this.raycaster.set(posAntesX, movX.normalize());
          this.raycaster.far = movX.length() + radioJugador;
          // Comprobar colisión solo contra los bloques invisibles del laberinto
          const intersectsX = this.raycaster.intersectObjects(this.laberinto.children, true);
          if (intersectsX.length > 0) {
            this.camera.position.copy(posAntesX);
            this.velocity.x = 0; // Detenemos la inercia lateral
          }
        }
      }

      // 2. Aplicar movimiento frontal/trasero y comprobar colisiones
      if (Math.abs(this.velocity.z) > 0.0001) {
        const posAntesZ = this.camera.position.clone();
        this.cameraControl.moveForward(-this.velocity.z * delta);
        const movZ = new THREE.Vector3().subVectors(this.camera.position, posAntesZ);

        if (movZ.length() > 0.0001) {
          this.raycaster.set(posAntesZ, movZ.normalize());
          this.raycaster.far = movZ.length() + radioJugador; // Limitamos el rayo también aquí
          const intersectsZ = this.raycaster.intersectObjects(this.laberinto.children, true);
          if (intersectsZ.length > 0) {
            this.camera.position.copy(posAntesZ);
            this.velocity.z = 0; // Detenemos la inercia frontal
          }
        }
      }
    }

    // Se actualiza el resto del modelo
    this.laberinto.update();
    this.bosque.update();
    if (this.moscaItem && this.pickUps.includes(this.moscaItem)) {
      this.moscaItem.update();
    }

    requestAnimationFrame(() => this.update())
  }

  checkPickupClick(event) {
    if (!this.pickUps || this.pickUps.length === 0) return false;

    // Calcular la posición del cursor en coordenadas de dispositivo normalizadas (NDC) de -1 a +1
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = 1 - (event.clientY / window.innerHeight) * 2;

    // Lanzar un rayo desde el cursor
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    // Distancia máxima a la que podemos coger el objeto 
    raycaster.far = 1.5;

    // Buscar intersecciones solo contra los objetos del array pickUps
    const intersects = raycaster.intersectObjects(this.pickUps, true);

    if (intersects.length > 0) {
      // Encontramos la malla concreta con la que choca el rayo
      let object = intersects[0].object;

      while (object && !this.pickUps.includes(object)) {
        object = object.parent;
      }

      if (object) {
        // Lo borramos de la escena
        this.remove(object);
        // Lo sacamos de la lista
        this.pickUps = this.pickUps.filter(p => p !== object);

        // Actualizamos las variables globales de la clase
        if (object instanceof Mosca) this.mosca_picked = true;
        else if (object instanceof Llave) this.llave_picked = true;
        else if (object instanceof Bota) this.bota_picked = true;
        else if (object instanceof Nenufar) this.nenufar_picked = true;

        return true;
      }
    }

    return false;
  }
}


/// La función   main
$(function () {

  // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
  var scene = new MyScene("#WebGL-output");

  // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
  window.addEventListener("resize", () => scene.onWindowResize());

  // Que no se nos olvide, la primera visualización.
  scene.update();
});
