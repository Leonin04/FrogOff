import * as THREE from 'three'

class Mosca extends THREE.Object3D {

  constructor(gui, titleGui) {
    super();

    this.tama = 0.1;

    this.tama_pata = 0.03;

    this.createGUI(gui, titleGui);

    this.materialCuerpo = new THREE.MeshStandardMaterial({ color: 0x3A3A3A });
    this.materialOjo = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
    this.materialAla = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    this.materialPata = new THREE.MeshStandardMaterial({ color: 0x804000 });

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

    return mosca;
  }

  //Piernas por barrido
  crearCuerpo(mosca) {

    var cajaCentral = new THREE.Mesh(
      new THREE.BoxGeometry(this.tama * 1.2, this.tama, this.tama), this.materialCuerpo
    );

    var cajaLateral1 = new THREE.Mesh(
      new THREE.BoxGeometry(this.tama * 0.5, this.tama * 0.5, this.tama * 0.5), this.materialCuerpo
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

    var meshPata1 = new THREE.Mesh(geometryPata, this.materialPata);
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

    var ala = this.crearAla();
    var ala2 = this.crearAla();

    ala.position.set(0, this.tama / 3, this.tama / 2);
    ala2.position.set(0, this.tama / 3,-this.tama / 2);



    mosca.add(ala);
    mosca.add(ala2);

  }

  //Básico
  crearCabeza(mosca) {
    var tama_cabeza = this.tama * 0.7;
    var tama_ojo = tama_cabeza / 3;

    var cabeza = new THREE.Mesh(
      new THREE.BoxGeometry(tama_cabeza, tama_cabeza, tama_cabeza), this.materialCuerpo
    );

    cabeza.position.set(this.tama / 2 + tama_cabeza/2, 0, 0);
    mosca.add(cabeza);
    
    var ojo1 = new THREE.Mesh(
      new THREE.BoxGeometry(tama_ojo, tama_ojo, tama_ojo/2), this.materialOjo);
    
    ojo1.position.set(tama_cabeza / 5, tama_cabeza / 4, tama_cabeza / 2);
    cabeza.add(ojo1);

    var ojo2 = ojo1.clone();
    ojo2.position.set(tama_cabeza / 5, tama_cabeza / 4, -tama_cabeza / 2);
    cabeza.add(ojo2);
  }

  //Extrusión
  crearAla(){
    var shape = new THREE.Shape();
    shape.moveTo(0, 0);      
    shape.lineTo(0.5, 0.2);  

    shape.lineTo(1.5, 2.5);
    shape.lineTo(2.5, 4.0);
    shape.lineTo(3.5, 5.0);

    shape.lineTo(5.0, 5.0);
    shape.lineTo(5.5, 4.5);

    shape.lineTo(5.0, 3.0);
    shape.lineTo(4.0, 1.5);
    shape.lineTo(2.0, 0.5);

    shape.lineTo(0, 0);

    var options1 = { depth : 1 , steps : 2 , bevelEnabled : false } ;

    var geometryAla = new THREE.ExtrudeGeometry(shape, options1);
    geometryAla.translate(0, 0, -0.5);
    
    var ala = new THREE.Mesh(geometryAla, this.materialAla);
    
    ala.scale.set(0.03, 0.03, 0.01);
    ala.rotateOnAxis(new THREE.Vector3(0, 0, 1), 3*Math.PI / 4);


    return ala;
  }

  setAngulo(valor) {
    this.cuerpo.rotation.z = valor;
  }

  update() {
  }
}

export { Mosca }
