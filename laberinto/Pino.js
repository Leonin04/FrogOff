import * as THREE from 'three'

class Pino extends THREE.Object3D {
  constructor() {
    super();

    // Tronco (muy bajito para que las hojas tapen la vista)
    const troncoRadio = 0.15;
    const troncoAlto = 0.2;
    const troncoGeo = new THREE.CylinderGeometry(troncoRadio, troncoRadio, troncoAlto, 12);
    // Movemos el tronco para que la base quede en Y=0
    troncoGeo.translate(0, troncoAlto / 2, 0);
    const troncoMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 }); // Marrón
    const tronco = new THREE.Mesh(troncoGeo, troncoMat);

    // Copa (Hojas) creadas por revolución
    const puntosCopa = [];
    puntosCopa.push(new THREE.Vector2(0, 0)); // Centro base
    puntosCopa.push(new THREE.Vector2(0.70, 0)); // Base algo más estrecha
    puntosCopa.push(new THREE.Vector2(0.4, 0.6)); // Pico hacia adentro
    puntosCopa.push(new THREE.Vector2(0.5, 0.6)); // Saliente capa media
    puntosCopa.push(new THREE.Vector2(0.25, 1.2)); // Pico hacia adentro
    puntosCopa.push(new THREE.Vector2(0.35, 1.2)); // Saliente capa alta
    puntosCopa.push(new THREE.Vector2(0, 1.8)); // Punta del pino (cierra en el centro)

    // Creamos la geometría de revolución a partir del perfil
    const copaGeo = new THREE.LatheGeometry(puntosCopa, 16);
    // Subimos la copa muy poco para que casi toque el suelo
    copaGeo.translate(0, 0.1, 0);
    const copaMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57 }); // Verde oscuro
    const copa = new THREE.Mesh(copaGeo, copaMat);

    this.add(tronco);
    this.add(copa);
  }
}

export { Pino }
