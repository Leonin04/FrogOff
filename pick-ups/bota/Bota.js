import * as THREE from 'three'
import * as CSG from '../../libs/three-bvh-csg.js'

class Bota extends THREE.Object3D {

  constructor(gui, titleGui) {
    super();

    this.tama = 0.1;
    this.altura = 0.25;

    this.suela = this.crearSuela();
    this.suela.scale.set(0.01, 0.01, 0.01);
    this.suela.rotateX(Math.PI / 2);

    this.zapato = this.crearZapato();
    this.zapato.scale.set(0.7, 0.7, 0.7);
    this.zapato.translateZ(-0.05);
    

    this.add(this.suela);
    this.add(this.zapato);

  }

  crearSuela(){
    const shape = new THREE.Shape();

    shape.moveTo(0, 10);

    shape.bezierCurveTo(4, 10, 6, 6, 5, 2);    
    shape.bezierCurveTo(4, 0, 7, -2, 7, -6);  
    shape.bezierCurveTo(7, -10, 4, -12, 0, -12); 

    shape.bezierCurveTo(-4, -12, -7, -10, -7, -6); 
    shape.bezierCurveTo(-7, -2, -4, 0, -5, 2);     
    shape.bezierCurveTo(-6, 6, -4, 10, 0, 10);    

    const material = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });

    const extrudeSettings = {
        depth: 1.5,          // El grosor de la suela
        bevelEnabled: true,  // Activamos bordes redondeados (bisel)
        bevelThickness: 0.3, // Qué tanto sobresale el bisel hacia afuera
        bevelSize: 0.3,      // Qué tan profundo es el redondeado
        bevelSegments: 5     // Suavidad del borde (más es más suave)
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    const suela = new THREE.Mesh(geometry, material);

    return suela;
  }

  crearZapato(){
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000, side: THREE.DoubleSide, flatShading: true });
    
    const esfera = new THREE.SphereGeometry(this.tama+0.05, 32, 32,0, Math.PI * 2, 0, Math.PI / 2);
    esfera.translate(0, 0, this.tama/2+0.005);
    esfera.scale(0.45,0.9,1.04)

    const cilindro = new THREE.CylinderGeometry(this.tama, this.tama, this.altura);
    cilindro.translate(0, this.altura/2,-0.005);
    cilindro.scale(0.95,0.95,0.95)

    const hueco = new THREE.CylinderGeometry(this.tama*0.7, this.tama*0.7, this.altura);
    hueco.translate(0, 2.5*2*this.altura/5,-0.003);

    var cilindroBrush = new CSG.Brush(cilindro, material);

    var huecoBrush = new CSG.Brush(hueco, material);

    var esferaBrush = new CSG.Brush(esfera, material);
    
    var evaluador = new CSG.Evaluator();
    
    var tmp = evaluador.evaluate(cilindroBrush, esferaBrush, CSG.ADDITION);
    var resultado = evaluador.evaluate(tmp, huecoBrush, CSG.SUBTRACTION);

    return resultado;
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

export { Bota }
