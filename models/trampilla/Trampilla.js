import * as THREE from 'three'
import * as CSG from '../../libs/three-bvh-csg.js'

class Trampilla extends THREE.Object3D {
  constructor(gui, titleGui) {
    super();

    // Necesitamos un Evaluador para las operaciones CSG
    this.evaluator = new CSG.Evaluator();

    this.materialMadera = new THREE.MeshStandardMaterial({ color: 0x6d4c41, roughness: 0.8 });
    this.materialMetal = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9, roughness: 0.2 });

    this.marco = this.createMarco();
    this.add(this.marco);

    // ... resto del constructor igual ...
    this.cuerpo = new THREE.Group();
    const puerta = this.createPuertaConAgarradera();
    puerta.position.x = 0.5; 
    this.cuerpo.add(puerta);
    this.cuerpo.position.set(-0.5, 0.05, 0); 
    this.add(this.cuerpo);

    this.createGUI(gui, titleGui);
  }

  createMarco() {
    // 1. Creamos los "Brushes" (pinceles) en lugar de Meshes normales
    const baseGeo = new THREE.BoxGeometry(1.2, 0.1, 1.2);
    const huecoGeo = new THREE.BoxGeometry(1.02, 0.2, 1.02);

    const baseBrush = new CSG.Brush(baseGeo, this.materialMadera);
    const huecoBrush = new CSG.Brush(huecoGeo, this.materialMadera);

    // Aseguramos que las posiciones de los Brushes sean correctas antes de operar
    baseBrush.updateMatrixWorld();
    huecoBrush.updateMatrixWorld();

    // 2. Ejecutamos la operación de resta
    // La sintaxis correcta suele ser: evaluate(brushA, brushB, operación)
    const resultadoMarco = this.evaluator.evaluate(baseBrush, huecoBrush, CSG.SUBTRACTION);
    
    // El resultado es un Mesh que ya contiene la geometría procesada
    resultadoMarco.castShadow = true;
    resultadoMarco.receiveShadow = true;

    return resultadoMarco;
  }

  // ... (tus funciones createPuertaConAgarradera, createGUI, setAngulo y update se mantienen igual)
  createPuertaConAgarradera() {
    const puertaGroup = new THREE.Group();
    const tablaGeo = new THREE.BoxGeometry(1, 0.08, 1);
    const tabla = new THREE.Mesh(tablaGeo, this.materialMadera);
    puertaGroup.add(tabla);

    const refuerzoGeo = new THREE.BoxGeometry(0.1, 0.02, 1);
    const r1 = new THREE.Mesh(refuerzoGeo, this.materialMetal);
    r1.position.set(-0.3, 0.05, 0);
    const r2 = r1.clone();
    r2.position.set(0.3, 0.05, 0);
    puertaGroup.add(r1, r2);

    const agarradera = new THREE.Group();
    const soporte = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.1), this.materialMetal);
    const anilla = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 12, 24), this.materialMetal);
    anilla.rotation.x = Math.PI / 2;
    anilla.position.y = 0.03;
    agarradera.add(soporte, anilla);
    agarradera.position.set(0.35, 0.05, 0);
    puertaGroup.add(agarradera);

    return puertaGroup;
  }

  createGUI(gui, titleGui) {
    this.guiControls = { rotacion: 0 };
    var folder = gui.addFolder(titleGui);
    folder.add(this.guiControls, 'rotacion', 0, 1.5, 0.01)
      .name('Apertura : ')
      .onChange((value) => this.setAngulo(value));
  }

  setAngulo(valor) {
    this.cuerpo.rotation.z = valor;
  }

  update() {}
}

export { Trampilla }