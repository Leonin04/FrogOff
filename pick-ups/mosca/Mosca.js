import * as THREE from 'three'

class Mosca extends THREE.Object3D {

  constructor(gui, titleGui) {
    super();

    this.tama = 0.1;

    this.tama_pata = 0.03;

    this.hecho = false;

    this.ala1;
    this.ala2;

    if (gui) {
      this.createGUI(gui, titleGui);
    } else {
      this.guiControls = { animacionActiva: true };
    }

    this.materialCuerpo = new THREE.MeshStandardMaterial({ color: 0x3A3A3A });
    this.materialOjo = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
    this.materialAla = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    this.materialPata = new THREE.MeshStandardMaterial({ color: 0x804000 });

    this.reloj = new THREE.Clock();
    this.velocidad = 10;

    this.mosca = this.crearMosca();

    this.add(this.mosca);
  }

  createGUI(gui, titleGui) {
    // Controles para el movimiento de la parte móvil
    this.guiControls = {
      animacionActiva: true,

      // Esta función se convertirá en un botón en la interfaz
      comenzarAnimacion: () => {
        this.guiControls.animacionActiva = !this.guiControls.animacionActiva;
        console.log("Animación: " + (this.guiControls.animacionActiva ? "ON" : "OFF"));
      }
    }

    var folder = gui.addFolder(titleGui);
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

    this.ala = this.crearAla();
    this.ala2 = this.crearAla();

    this.ala.position.set(0, this.tama / 3, this.tama / 2);
    this.ala2.position.set(0, this.tama / 3, -this.tama / 2);



    mosca.add(this.ala);
    mosca.add(this.ala2);

  }

  //Básico
  crearCabeza(mosca) {
    var tama_cabeza = this.tama * 0.7;
    var tama_ojo = tama_cabeza / 3;

    var cabeza = new THREE.Mesh(
      new THREE.BoxGeometry(tama_cabeza, tama_cabeza, tama_cabeza), this.materialCuerpo
    );

    cabeza.position.set(this.tama / 2 + tama_cabeza / 2, 0, 0);
    mosca.add(cabeza);

    var ojo1 = new THREE.Mesh(
      new THREE.BoxGeometry(tama_ojo, tama_ojo, tama_ojo / 2), this.materialOjo);

    ojo1.position.set(tama_cabeza / 5, tama_cabeza / 4, tama_cabeza / 2);
    cabeza.add(ojo1);

    var ojo2 = ojo1.clone();
    ojo2.position.set(tama_cabeza / 5, tama_cabeza / 4, -tama_cabeza / 2);
    cabeza.add(ojo2);
  }

  //Extrusión
  crearAla() {
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

    var options1 = { depth: 1, steps: 2, bevelEnabled: false };

    var geometryAla = new THREE.ExtrudeGeometry(shape, options1);
    geometryAla.translate(0, 0, -0.5);

    var ala = new THREE.Mesh(geometryAla, this.materialAla);

    ala.scale.set(0.03, 0.03, 0.01);
    ala.rotateOnAxis(new THREE.Vector3(0, 0, 1), 3 * Math.PI / 4);


    return ala;
  }

  update() {

    var segundos = this.reloj.getDelta();

    // Ciclo de 6 segundos: 5 de animación, 1 de pausa
    let tiempoTotal = this.reloj.getElapsedTime();
    if (tiempoTotal % 6.0 < 5.0) {
      this.guiControls.animacionActiva = true;
    } else {
      this.guiControls.animacionActiva = false;
    }

    let suavidad = 5 * segundos;

    let suavidad2 = segundos;

    let targetX, targetZ, targetX2, targetY, targetY2;

    if (this.guiControls.animacionActiva) {
      let tiempo = this.reloj.getElapsedTime() * this.velocidad;
      let oscilacion = Math.sin(tiempo) * 5;

      targetX = THREE.MathUtils.degToRad(70);
      targetX2 = THREE.MathUtils.degToRad(-70);
      targetZ = THREE.MathUtils.degToRad(100);
      targetY = THREE.MathUtils.degToRad(-40) - oscilacion;
      targetY2 = THREE.MathUtils.degToRad(40) + oscilacion;
    } else {
      targetX = 0;
      targetX2 = 0;
      targetZ = 3 * Math.PI / 4;
      this.hecho = false;
    }

    if (this.ala && this.ala2) {
      this.ala.rotation.x = THREE.MathUtils.lerp(this.ala.rotation.x, targetX, suavidad);
      this.ala.rotation.z = THREE.MathUtils.lerp(this.ala.rotation.z, targetZ, suavidad);
      this.ala2.rotation.x = THREE.MathUtils.lerp(this.ala2.rotation.x, targetX2, suavidad);
      this.ala2.rotation.z = THREE.MathUtils.lerp(this.ala2.rotation.z, targetZ, suavidad);

      if (Math.abs(this.ala.rotation.x - targetX) < 0.01) {
        this.hecho = true;
      }

      if (this.hecho && this.guiControls.animacionActiva) {
        this.ala.rotation.y = THREE.MathUtils.lerp(this.ala.rotation.y, targetY, suavidad2);
        this.ala2.rotation.y = THREE.MathUtils.lerp(this.ala2.rotation.y, targetY2, suavidad2);
      } else {
        this.ala.rotation.y = THREE.MathUtils.lerp(this.ala.rotation.y, 0, suavidad);
        this.ala2.rotation.y = THREE.MathUtils.lerp(this.ala2.rotation.y, 0, suavidad);
      }
    }
  }
}

export { Mosca }
