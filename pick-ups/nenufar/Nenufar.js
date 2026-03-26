import * as THREE from 'three'

class Nenufar extends THREE.Object3D {

  constructor(gui, titleGui) {
    super();

    this.createGUI(gui, titleGui);

    this.materialBase = new THREE.MeshStandardMaterial({ color: 0x3A3A3A });
    this.materialFlor = new THREE.MeshStandardMaterial({ color: 0xFF0000 });


    this.nenufar = this.crearNenufar();

    this.add(this.nenufar);
  }

  crearNenufar() {
    
  }

  createGUI(gui, titleGui) {
    // Controles para el movimiento de la parte móvil
    this.guiControls = {
      rotacion: 0
    }

    // Se crea una sección para los controles de la caja
    var folder = gui.addFolder(titleGui);
    // Estas lineas son las que añaden los componentes de la interfaz
    // Las tres cifras indican un valor mínimo, un máximo y el incremento
    folder.add(this.guiControls, 'rotacion', -0.125, 0.2, 0.001)
      .name('Apertura : ')
      .onChange((value) => this.setAngulo(-value));
  }

  setAngulo(valor) {
    this.cuerpo.rotation.z = valor;
  }

  update() {
  }
}

export { Mosca }
