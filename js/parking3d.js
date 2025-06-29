import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// Configuration constants
const CONFIG = {
  renderer: {
    antialias: true,
    powerPreference: "high-performance",
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 0.8,
    shadowMapType: THREE.PCFSoftShadowMap
  },
  camera: {
    fov: 60,
    near: 0.1,
    far: 1000,
    position: new THREE.Vector3(10, 8, 15)
  },
  lighting: {
    ambient: {
      color: 0x404040,
      intensity: 0.3
    },
    directional: {
      color: 0xffffff,
      intensity: 1,
      position: new THREE.Vector3(50, 100, 50),
      shadow: {
        mapSize: new THREE.Vector2(2048, 2048),
        camera: {
          near: 0.5,
          far: 500,
          left: -50,
          right: 50,
          top: 50,
          bottom: -50
        }
      }
    }
  },
  parkingLot: {
    size: { width: 100, height: 50 },
    floor: {
      textureRepeat: new THREE.Vector2(20, 20),
      material: {
        roughness: 0.8,
        metalness: 0.1
      }
    },
    lines: {
      spacing: 4,
      count: 11,
      material: {
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.2,
        roughness: 0.3,
        metalness: 0.5
      }
    },
    columns: {
      spacing: 15,
      count: 7,
      material: {
        color: 0xcccccc,
        roughness: 0.3,
        metalness: 0.2
      }
    }
  },
  bloom: {
    strength: 0.5,
    radius: 0.8,
    threshold: 0.6
  }
};

export class ParkingScene {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      CONFIG.camera.fov,
      window.innerWidth / (window.innerHeight * 0.7),
      CONFIG.camera.near,
      CONFIG.camera.far
    );
    this.camera.position.copy(CONFIG.camera.position);
    
    this.renderer = new THREE.WebGLRenderer({
      antialias: CONFIG.renderer.antialias,
      powerPreference: CONFIG.renderer.powerPreference
    });
    
    this.init().catch(console.error);
  }

  async init() {
    await this.setupRenderer();
    await this.loadEnvironment();
    await this.loadModels();
    this.setupLighting();
    this.setupParkingLot();
    this.setupEnvironmentDetails();
    this.setupControls();
    this.setupPostProcessing();
    this.setupEventListeners();
    this.animate();
  }

  async setupRenderer() {
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = CONFIG.renderer.toneMapping;
    this.renderer.toneMappingExposure = CONFIG.renderer.toneMappingExposure;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = CONFIG.renderer.shadowMapType;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight * 0.7);
    
    document.getElementById('parking-visualization').appendChild(this.renderer.domElement);
  }

  async loadEnvironment() {
    const rgbeLoader = new RGBELoader();
    this.hdrTexture = await rgbeLoader.loadAsync('assets/textures/environment.hdr');
    this.hdrTexture.mapping = THREE.EquirectangularReflectionMapping;
    this.scene.environment = this.hdrTexture;
    this.scene.background = this.hdrTexture;
  }

  async loadModels() {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
    
    const carModel = await gltfLoader.loadAsync('assets/models/premium_car.glb');
    this.car = this.setupCarModel(carModel);
    this.scene.add(this.car);
  }

  setupCarModel(gltf) {
    const car = gltf.scene;
    car.position.set(0, 0.3, 0);
    car.scale.set(0.8, 0.8, 0.8);
    
    car.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        if (child.material) {
          child.material.roughness = 0.1;
          child.material.metalness = 0.9;
          child.material.envMapIntensity = 1.2;
          
          if (child.name.includes('Body')) {
            child.material = new THREE.MeshPhysicalMaterial({
              color: 0x0066cc,
              roughness: 0.2,
              metalness: 0.9,
              clearcoat: 1,
              clearcoatRoughness: 0.1,
              sheen: 0.5,
              ior: 1.5,
              envMapIntensity: 1.5
            });
          }
          
          if (child.name.includes('Glass')) {
            child.material = new THREE.MeshPhysicalMaterial({
              color: 0x7ec0ee,
              roughness: 0,
              metalness: 0,
              transmission: 0.9,
              thickness: 0.5,
              ior: 1.5,
              envMapIntensity: 2
            });
          }
        }
      }
    });
    
    return car;
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(
      CONFIG.lighting.ambient.color,
      CONFIG.lighting.ambient.intensity
    );
    this.scene.add(ambientLight);
    
    // Directional light (sun)
    this.sunLight = new THREE.DirectionalLight(
      CONFIG.lighting.directional.color,
      CONFIG.lighting.directional.intensity
    );
    this.sunLight.position.copy(CONFIG.lighting.directional.position);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.copy(CONFIG.lighting.directional.shadow.mapSize);
    this.sunLight.shadow.camera.near = CONFIG.lighting.directional.shadow.camera.near;
    this.sunLight.shadow.camera.far = CONFIG.lighting.directional.shadow.camera.far;
    this.sunLight.shadow.camera.left = CONFIG.lighting.directional.shadow.camera.left;
    this.sunLight.shadow.camera.right = CONFIG.lighting.directional.shadow.camera.right;
    this.sunLight.shadow.camera.top = CONFIG.lighting.directional.shadow.camera.top;
    this.sunLight.shadow.camera.bottom = CONFIG.lighting.directional.shadow.camera.bottom;
    this.sunLight.shadow.bias = -0.001;
    this.scene.add(this.sunLight);
    
    // Parking spot lights
    for (let i = -20; i <= 20; i += 4) {
      const spotLight = new THREE.RectAreaLight(0xfff8e7, 2, 3, 1);
      spotLight.position.set(0, 5, i);
      spotLight.rotation.x = -Math.PI / 2;
      this.scene.add(spotLight);
    }
    
    // Fog
    this.scene.fog = new THREE.FogExp2(0x000000, 0.002);
  }

  async setupParkingLot() {
    this.parkingGroup = new THREE.Group();
    
    // Load textures
    const textureLoader = new THREE.TextureLoader();
    const [asphaltTexture, asphaltNormalMap, asphaltRoughnessMap] = await Promise.all([
      textureLoader.loadAsync('assets/textures/asphalt_highres.jpg'),
      textureLoader.loadAsync('assets/textures/asphalt_normal.jpg'),
      textureLoader.loadAsync('assets/textures/asphalt_roughness.jpg')
    ]);
    
    // Configure textures
    [asphaltTexture, asphaltNormalMap, asphaltRoughnessMap].forEach(texture => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.copy(CONFIG.parkingLot.floor.textureRepeat);
    });
    
    // Parking floor
    const floorGeometry = new THREE.PlaneGeometry(
      CONFIG.parkingLot.size.width,
      CONFIG.parkingLot.size.height
    );
    const floorMaterial = new THREE.MeshStandardMaterial({
      map: asphaltTexture,
      normalMap: asphaltNormalMap,
      roughnessMap: asphaltRoughnessMap,
      roughness: CONFIG.parkingLot.floor.material.roughness,
      metalness: CONFIG.parkingLot.floor.material.metalness
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.parkingGroup.add(floor);
    
    // Parking lines
    const lineMaterial = new THREE.MeshStandardMaterial(CONFIG.parkingLot.lines.material);
    const lineGeometry = new THREE.PlaneGeometry(3, 0.2);
    
    for (let i = 0; i < CONFIG.parkingLot.lines.count; i++) {
      const zPos = -20 + (i * CONFIG.parkingLot.lines.spacing);
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.position.set(0, 0.01, zPos);
      line.rotation.x = -Math.PI / 2;
      this.parkingGroup.add(line);
    }
    
    // Parking columns
    const columnGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 16);
    const columnMaterial = new THREE.MeshStandardMaterial(CONFIG.parkingLot.columns.material);
    
    for (let i = 0; i < CONFIG.parkingLot.columns.count; i++) {
      const xPos = -45 + (i * CONFIG.parkingLot.columns.spacing);
      
      const column = new THREE.Mesh(columnGeometry, columnMaterial);
      column.position.set(xPos, 2, -22);
      column.castShadow = true;
      this.parkingGroup.add(column);
      
      const column2 = column.clone();
      column2.position.set(xPos, 2, 22);
      this.parkingGroup.add(column2);
    }
    
    this.scene.add(this.parkingGroup);
  }

  setupEnvironmentDetails() {
    // Ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(
      CONFIG.parkingLot.size.width,
      CONFIG.parkingLot.size.height
    );
    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.8,
      metalness: 0.1
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.position.y = 8;
    ceiling.rotation.x = Math.PI / 2;
    this.scene.add(ceiling);
    
    // Hanging lights
    const lightGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const lightMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff8e7,
      emissive: 0xfff8e7,
      emissiveIntensity: 2,
      roughness: 0
    });
    
    for (let x = -40; x <= 40; x += 10) {
      for (let z = -20; z <= 20; z += 10) {
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.set(x, 7, z);
        this.scene.add(light);
        
        const pointLight = new THREE.PointLight(0xfff8e7, 1, 10);
        pointLight.position.set(x, 6.5, z);
        this.scene.add(pointLight);
      }
    }
    
    // Parked cars
    const carMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x555555,
      roughness: 0.3,
      metalness: 0.8,
      clearcoat: 1,
      clearcoatRoughness: 0.1
    });
    
    for (let x = -15; x <= 15; x += 8) {
      if (x === 0) continue;
      
      const carBody = new THREE.Mesh(new THREE.BoxGeometry(4, 1.5, 2), carMaterial);
      carBody.position.set(x, 0.75, 10);
      carBody.rotation.y = Math.PI;
      this.scene.add(carBody);
      
      const carBody2 = carBody.clone();
      carBody2.position.set(x, 0.75, -10);
      carBody2.rotation.y = 0;
      this.scene.add(carBody2);
    }
    
    // Parking signs
    const signGeometry = new THREE.PlaneGeometry(2, 1.5);
    const signMaterial = new THREE.MeshStandardMaterial({
      color: 0x0055ff,
      emissive: 0x0055ff,
      emissiveIntensity: 0.3,
      side: THREE.DoubleSide
    });
    
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(0, 3, -24);
    sign.rotation.y = Math.PI;
    this.scene.add(sign);
    
    const sign2 = sign.clone();
    sign2.position.set(0, 3, 24);
    sign2.rotation.y = 0;
    this.scene.add(sign2);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI * 0.9;
  }

  setupPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight * 0.7),
      CONFIG.bloom.strength,
      CONFIG.bloom.radius,
      CONFIG.bloom.threshold
    );
    this.composer.addPass(bloomPass);
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / (window.innerHeight * 0.7);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight * 0.7);
    this.composer.setSize(window.innerWidth, window.innerHeight * 0.7);
  }

  updateCarAnimation() {
    if (!window.carMoving) return;
    
    // Move car forward
    this.car.position.x += 0.05;
    
    // Reset position when out of bounds
    if (this.car.position.x > 50) {
      this.car.position.x = -50;
    }
    
    // Subtle suspension animation
    this.car.position.y = 0.3 + Math.sin(Date.now() * 0.01) * 0.02;
    
    // Wheel rotation
    this.car.traverse(child => {
      if (child.name.includes('Wheel')) {
        child.rotation.x += 0.1;
      }
    });
    
    // Headlight animation
    const time = Date.now() * 0.001;
    this.car.traverse(child => {
      if (child.name.includes('Headlight')) {
        child.material.emissiveIntensity = 2 + Math.sin(time * 5) * 0.5;
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    this.updateCarAnimation();
    this.controls.update();
    this.composer.render();
  }
}

// Initialize the scene
new ParkingScene();