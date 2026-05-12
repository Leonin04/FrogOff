import * as THREE from 'three'
import { Pino } from './Pino.js'

class Bosque extends THREE.Object3D {

  static WALL = "X";
  static FREE = " ";

  constructor(archivo, sincronizacion = null) {
    super();

    // Medidas de un bloque para posicionar los árboles igual que las paredes invisibles
    this.anchoBloque = 2.0;

    // Leemos el archivo, lo pasamos a un vector de string y lo procesamos 
    // para ir creando y añadiendo los pinos
    const loader = new THREE.FileLoader();
    loader.load(archivo, (file) => {
      const laberintoMatriz = file.split(/\r?\n/);
      laberintoMatriz.pop(); // La última fila está vacía
      this.xNumBloques = laberintoMatriz[0].length;
      this.zNumBloques = laberintoMatriz.length;
      var unPino;
      for (let fila = 0; fila < this.zNumBloques; fila++) {
        for (let columna = 0; columna < this.xNumBloques; columna++) {
          switch (laberintoMatriz[fila][columna]) {
            case Bosque.WALL:
              unPino = new Pino();
              // Escalar el pino al doble para que encaje en el bloque de 2.0x2.0
              unPino.scale.set(2, 2, 2);
              // Les damos una pequeña variación aleatoria de rotación para que no parezcan clónicos
              unPino.rotation.y = Math.random() * Math.PI * 2;
              unPino.position.set(columna * this.anchoBloque, 0, fila * this.anchoBloque);
              this.add(unPino);
              break;
          }
        }
      }
      // Para centrar el bosque completo con respecto al sistema de coordenadas (igual que el laberinto)
      const desfaseX = (this.xNumBloques - 1) / 2 * this.anchoBloque;
      const desfaseZ = (this.zNumBloques - 1) / 2 * this.anchoBloque;
      this.position.x = -desfaseX;
      this.position.z = -desfaseZ;
      if (sincronizacion)
        sincronizacion.resolve();
    });
  }

  update() {
    ;
  }
}

export { Bosque }
