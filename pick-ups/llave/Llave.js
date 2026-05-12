import * as THREE from 'three'
import * as CSG from '../../libs/three-bvh-csg.js'

class Llave extends THREE.Object3D {

  constructor(gui, titleGui) {
    super();

    this.tama = 0.1;
    this.altura = this.tama/2

    this.matLlave = new THREE.MeshStandardMaterial({ color: 0xF2CB3F });

    if (gui) {
      this.createGUI(gui, titleGui);
    }

    this.llave = this.crearLlave();

    this.cuerda = this.crearCuerda();

    this.add(this.llave);

    this.cuerda.scale.set(0.1, 0.1, 0.1);
    this.cuerda.rotateX(Math.PI / 2);
    this.cuerda.position.set(-this.tama*0.7, 0, 0);

    this.add(this.cuerda);
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

  crearLlave() {
    var llave = new THREE.Object3D();
    
    var redondez = new THREE.CylinderGeometry(this.tama, this.tama, this.altura);

    var hueco = new THREE.CylinderGeometry(this.tama*0.7, this.tama*0.7, this.altura*2);


    var redondezBrush = new CSG.Brush(redondez, this.matLlave);
    var huecoBrush = new CSG.Brush(hueco, this.matLlave);

    var evaluador = new CSG.Evaluator();
    var resultado = evaluador.evaluate(redondezBrush, huecoBrush, CSG.SUBTRACTION);

    
    llave.add(resultado);

    var alargado = new THREE.Mesh(
      new THREE.CylinderGeometry(this.altura/2, this.altura/2, this.tama * 2.5), this.matLlave
    );

    alargado.rotateZ(Math.PI / 2);

    alargado.position.set(this.tama*2.2, 0, 0);

    llave.add(alargado);

    var pata1 = new THREE.Mesh(
        new THREE.CylinderGeometry(this.tama/4, this.tama/4, this.tama), this.matLlave
    );

    pata1.position.set(this.tama*2.4, 0, this.tama/2);

    pata1.rotateX(Math.PI / 2);

    llave.add(pata1);

    var pata2 = pata1.clone();
    
    pata2.position.set(this.tama*3.1, 0, this.tama/2);

    llave.add(pata2);

    return llave;
  }

  crearCuerda(){
    const points = [];
    const radio = 0.1; 
    const segmentos = 16;

    for (let i = 0; i <= segmentos; i++) {
        const theta = (i / segmentos) * Math.PI * 2;
        const x = 0.7 + radio * Math.cos(theta); 
        const y = radio * Math.sin(theta);
        points.push(new THREE.Vector2(x, y));
    }

    const geometry = new THREE.LatheGeometry(points, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0x905010, side: THREE.DoubleSide });
    const lathe = new THREE.Mesh(geometry, material);

    return lathe;
  }


  setAngulo(valor) {
    this.cuerpo.rotation.z = valor;
  }

  update() {
  }
}

export { Llave }
