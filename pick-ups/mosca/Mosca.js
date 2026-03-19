import * as THREE from 'three'

class Mosca extends THREE.Object3D {

  constructor(gui, titleGui) {
    super();

    this.tama = 0.1;

    this.tama_pata = 0.03;

    this.createGUI(gui, titleGui);

    this.material = new THREE.MeshStandardMaterial({ color: 0xCF0000 });

    this.mosca = this.crearMosca();

    this.add(this.mosca);
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

  crearMosca() {
    var mosca = new THREE.Object3D();

    this.crearCuerpo(mosca);
    this.crearCabeza(mosca);
    this.crearAlas(mosca);

    return mosca;
  }

  //Piernas por barrido
  crearCuerpo(mosca) {

    var matCuerpo = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });

    var cajaCentral = new THREE.Mesh(
      new THREE.BoxGeometry(this.tama * 1.2, this.tama, this.tama), matCuerpo
    );

    var cajaLateral1 = new THREE.Mesh(
      new THREE.BoxGeometry(this.tama * 0.5, this.tama * 0.5, this.tama * 0.5), matCuerpo
    );

    cajaCentral.position.set(0, 0, 0);

    cajaLateral1.position.set(-cajaCentral.geometry.parameters.width / 2 - cajaLateral1.geometry.parameters.width / 2, 0, 0);

    mosca.rotation.z = this.guiControls.rotacion;

    mosca.add(cajaCentral);
    mosca.add(cajaLateral1);

    mosca.position.set(0, this.tama / 2 + 0.03, 0);

    //Creo las patas
    var shape = new THREE.Shape();
    shape.moveTo(-0.005, -0.005);
    shape.lineTo(0.005, -0.005);
    shape.lineTo(0.005, 0.005);
    shape.lineTo(-0.005, 0.005);
    shape.lineTo(-0.005, -0.005);

    var pts = new Array();
    pts.push(new THREE.Vector3(0, 0, 0));
    pts.push(new THREE.Vector3(0, this.tama_pata / 3, 0));
    pts.push(new THREE.Vector3(0, 2 * this.tama_pata / 3, 0));
    pts.push(new THREE.Vector3(-0.01, this.tama_pata, 0));
    pts.push(new THREE.Vector3(-0.01, this.tama_pata * 4 / 3, 0));

    var path = new THREE.CatmullRomCurve3(pts);

    var options = { steps: 50, curveSegments: 4, extrudePath: path };

    var geometryPata = new THREE.ExtrudeGeometry(shape, options);

    var matPata = new THREE.MeshStandardMaterial({ color: 0x804000 });

    var meshPata1 = new THREE.Mesh(geometryPata, matPata);
    meshPata1.position.set(2 * this.tama / 5, -this.tama / 2 - this.tama_pata, -this.tama / 2);
    mosca.add(meshPata1);

    var meshPata2 = meshPata1.clone();
    meshPata2.position.set(-2 * this.tama / 5, -this.tama / 2 - this.tama_pata, -this.tama / 2);
    meshPata2.rotation.y = Math.PI;
    mosca.add(meshPata2);

    var meshPata3 = meshPata1.clone();
    meshPata3.position.set(2 * this.tama / 5, -this.tama / 2 - this.tama_pata, this.tama / 2);
    mosca.add(meshPata3);

    var meshPata4 = meshPata1.clone();
    meshPata4.position.set(-2 * this.tama / 5, -this.tama / 2 - this.tama_pata, this.tama / 2);
    meshPata4.rotation.y = Math.PI;
    mosca.add(meshPata4);

  }

  //Básico
  crearCabeza(mosca) {
    var tama_cabeza = this.tama * 0.7;

    var matCabeza = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });

    var cabeza = new THREE.Mesh(
      new THREE.BoxGeometry(tama_cabeza, tama_cabeza, tama_cabeza), matCabeza
    );

    cabeza.position.set(this.tama / 2 + tama_cabeza / 2, 0, 0);
    mosca.add(cabeza);
  }

  //Creadas con extrusión
  crearAlas() {

  }

  setAngulo(valor) {
    this.cuerpo.rotation.z = valor;
  }

  update() {
  }
}

export { Mosca }
