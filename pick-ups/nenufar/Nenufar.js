import * as THREE from 'three'

class Nenufar extends THREE.Object3D {

  constructor(gui, titleGui) {
    super();

    this.createGUI(gui, titleGui);

    this.materialBase = new THREE.MeshStandardMaterial({ color: 0x12a14b });
    this.materialFlor = new THREE.MeshStandardMaterial({
        color: 0xff766c,
        side: THREE.DoubleSide,
        flatShading: true
    });

    this.alto  = 0.5;



    this.nenufar = this.crearNenufar();

    this.add(this.nenufar);

    this.flor = this.crearFlor();
    this.flor.scale.set(0.015, 0.015, 0.015);
    
    this.flor.position.set(-0.10, this.alto*0.05, -0.05);
    this.add(this.flor);
  }

  crearNenufar() {
    var shape = new THREE.Shape();
        shape.moveTo(0, -2.25);
        shape.lineTo(1, -2);
        shape.lineTo(2, -1);
        shape.lineTo(2, 1);
        shape.lineTo(1, 2);
        shape.lineTo(0, 0.5);
        shape.lineTo(-1, 2);
        shape.lineTo(-2, 1);
        shape.lineTo(-2, -1);
        shape.lineTo(-1, -2);
        shape.lineTo(0, -2.25);

        var pts = new Array();
            pts.push(new THREE.Vector3(0, 0, 0));
            pts.push(new THREE.Vector3(0, 0, this.alto));
            
        
        var path = new THREE.CatmullRomCurve3(pts);

        var options = { steps: 50, curveSegments: 4, extrudePath: path };
            
        var geometryNenufar = new THREE.ExtrudeGeometry(shape, options);
        
        var meshNenufar = new THREE.Mesh(geometryNenufar, this.materialBase);

        meshNenufar.scale.set(0.1, 0.1, 0.1);
        meshNenufar.rotation.x = Math.PI / 2;
        meshNenufar.position.set(0, this.alto*0.1/2, 0);

        return meshNenufar;
  }

  crearFlor() {
    const points = [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(2, 0.2),
        new THREE.Vector2(3, 1),
        new THREE.Vector2(4, 0.5),
        new THREE.Vector2(5, 1.5),
        new THREE.Vector2(4, 2.5)
    ];

    const geometry = new THREE.LatheGeometry(points, 12);

    const flor = new THREE.Mesh(geometry, this.materialFlor);

    const matPalitos = new THREE.MeshStandardMaterial({ color: 0xfff932 });

    var direcciones = [
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0.5, 1, 0.5).normalize(),
      new THREE.Vector3(-0.5, 1, 0.5).normalize(),
      new THREE.Vector3(0.5, 1, -0.5).normalize(),
      new THREE.Vector3(-0.5, 1, -0.5).normalize()
    ];

    for (let i = 0; i < 5; i++) {
    
      var palitoGeom = new THREE.BoxGeometry(0.1, 1.5, 0.1);
      palitoGeom.translate(direcciones[i].x, 0.8, direcciones[i].z); 

      var topeGeom = new THREE.SphereGeometry(0.15, 16, 16);
      topeGeom.translate(direcciones[i].x, 1.5, direcciones[i].z);

      flor.add(new THREE.Mesh(palitoGeom, matPalitos));
      flor.add(new THREE.Mesh(topeGeom, matPalitos));
    }

    return flor;
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

export { Nenufar }
