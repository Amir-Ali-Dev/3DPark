// Enhanced 3D Parking Simulation with Advanced Features
const initParkingScene = () => {
    // Scene initialization with environment map
    const scene = new THREE.Scene();
    const envTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg');
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = envTexture;
    scene.environment = envTexture;
    scene.fog = new THREE.FogExp2(0xf0f0f0, 0.015);
    
    // Advanced camera system with smooth transitions
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight * 0.6), 0.1, 1000);
    const cameras = {
        follow: camera,
        overhead: new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight * 0.6), 0.1, 1000),
        driver: new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight * 0.6), 0.1, 1000),
        security: new THREE.PerspectiveCamera(60, window.innerWidth / (window.innerHeight * 0.6), 0.1, 1000)
    };
    
    // Set initial camera positions
    cameras.overhead.position.set(0, 50, 0);
    cameras.overhead.lookAt(0, 0, 0);
    cameras.driver.position.set(-2, 1.5, 0);
    cameras.security.position.set(0, 8, -31.9);
    cameras.security.rotation.y = Math.PI;
    
    const renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('parking-canvas'), 
        antialias: true,
        powerPreference: "high-performance"
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight * 0.6);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    // Enhanced lighting system with dynamic day/night cycle
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 150;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);
    
    // Add hemisphere light for more natural ambient
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);
    
    // Parking lot with improved PBR materials
    const parkingGeometry = new THREE.BoxGeometry(120, 0.2, 60);
    const parkingMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        roughness: 0.7,
        metalness: 0.2,
        normalMap: createNormalMap(120, 60, 0.1)
    });
    const parkingLot = new THREE.Mesh(parkingGeometry, parkingMaterial);
    parkingLot.receiveShadow = true;
    parkingLot.position.y = -0.1;
    scene.add(parkingLot);
    
    // Helper function to create simple normal maps
    function createNormalMap(width, height, intensity) {
        const size = width * height;
        const data = new Uint8Array(4 * size);
        
        for (let i = 0; i < size; i++) {
            const stride = i * 4;
            const x = (i % width) / width;
            const y = Math.floor(i / width) / height;
            
            // Simple noise pattern
            const r = Math.sin(x * Math.PI * 10) * Math.cos(y * Math.PI * 10) * intensity;
            
            data[stride] = r * 255;
            data[stride + 1] = r * 255;
            data[stride + 2] = 255;
            data[stride + 3] = 255;
        }
        
        const texture = new THREE.DataTexture(data, width, height);
        texture.needsUpdate = true;
        return texture;
    }
    
    // Parking lines with better spacing and markings
    const lineMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.5,
        emissive: 0x444444,
        emissiveIntensity: 0.2
    });
    
    for (let i = -20; i <= 20; i += 5) {
        // Main parking lines
        const lineGeometry = new THREE.BoxGeometry(100, 0.21, 0.3);
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.set(0, 0.1, i);
        line.receiveShadow = true;
        scene.add(line);
        
        // Parking spot numbers with improved visibility
        if (i % 10 === 0) {
            for (let j = -45; j <= 45; j += 10) {
                const loader = new THREE.FontLoader();
                loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
                    const numberGeometry = new THREE.TextGeometry((Math.abs(j/10) + 1).toString(), {
                        font: font,
                        size: 0.5,
                        height: 0.01,
                        curveSegments: 12,
                        bevelEnabled: false
                    });
                    numberGeometry.center();
                    
                    const numberMaterial = new THREE.MeshStandardMaterial({ 
                        color: 0xffffff,
                        emissive: 0xffffff,
                        emissiveIntensity: 0.3
                    });
                    const number = new THREE.Mesh(numberGeometry, numberMaterial);
                    number.position.set(j, 0.11, i > 0 ? i - 0.8 : i + 0.8);
                    number.rotation.x = -Math.PI / 2;
                    scene.add(number);
                });
            }
        }
    }
    
    // Enhanced environment with interactive elements
    const addEnvironment = () => {
        // Grid helper for orientation
        const gridHelper = new THREE.GridHelper(150, 50, 0x888888, 0xcccccc);
        gridHelper.position.y = -0.11;
        scene.add(gridHelper);
        
        // Perimeter walls with improved materials
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xdddddd,
            roughness: 0.5,
            metalness: 0.2,
            normalMap: createNormalMap(130, 12, 0.05)
        });
        
        // Back wall with security camera
        const backWall = new THREE.Mesh(new THREE.BoxGeometry(130, 12, 1), wallMaterial);
        backWall.position.set(0, 6, -32);
        backWall.receiveShadow = true;
        scene.add(backWall);
        
        // Add security camera to back wall
        const cameraModel = createSecurityCamera();
        cameraModel.position.set(0, 8, -31.9);
        cameraModel.rotation.y = Math.PI;
        cameraModel.userData.isInteractive = true;
        cameraModel.userData.description = "Security Camera #1";
        scene.add(cameraModel);
        
        // Side walls with windows
        const sideWallGeometry = new THREE.BoxGeometry(1, 12, 70);
        const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
        leftWall.position.set(-62, 6, 0);
        leftWall.receiveShadow = true;
        scene.add(leftWall);
        
        const rightWall = leftWall.clone();
        rightWall.position.set(62, 6, 0);
        scene.add(rightWall);
        
        // Add window panels to side walls
        const windowPanelGeometry = new THREE.BoxGeometry(0.9, 8, 10);
        const windowMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x7ec0ee,
            transmission: 0.8,
            roughness: 0.05,
            metalness: 0.2,
            clearcoat: 0.5,
            clearcoatRoughness: 0.1
        });
        
        for (let z = -30; z <= 30; z += 15) {
            const leftWindow = new THREE.Mesh(windowPanelGeometry, windowMaterial);
            leftWindow.position.set(-61.9, 5, z);
            scene.add(leftWindow);
            
            const rightWindow = leftWindow.clone();
            rightWindow.position.set(61.9, 5, z);
            scene.add(rightWindow);
        }
        
        // Ceiling lights with improved models
        for (let i = -50; i <= 50; i += 15) {
            // Lighting fixture base
            const lightBase = new THREE.Mesh(
                new THREE.CylinderGeometry(0.6, 0.6, 0.1, 32),
                new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9 })
            );
            lightBase.position.set(i, 8, 0);
            lightBase.rotation.x = Math.PI / 2;
            scene.add(lightBase);
            
            // Light cover
            const lightCover = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.5, 0.05, 32),
                new THREE.MeshPhysicalMaterial({
                    color: 0xffffff,
                    transmission: 0.9,
                    roughness: 0.05,
                    metalness: 0.1,
                    clearcoat: 0.5
                })
            );
            lightCover.position.set(i, 7.95, 0);
            lightCover.rotation.x = Math.PI / 2;
            scene.add(lightCover);
            
            // Actual light source with flicker effect
            const pointLight = new THREE.PointLight(0xffffcc, 1.5, 30, 2);
            pointLight.position.set(i, 7.9, 0);
            pointLight.castShadow = true;
            pointLight.shadow.mapSize.width = 1024;
            pointLight.shadow.mapSize.height = 1024;
            scene.add(pointLight);
            
            // Add occasional flickering to lights
            if (i % 30 === 0) {
                setInterval(() => {
                    pointLight.intensity = 0.8 + Math.random() * 0.7;
                }, 200 + Math.random() * 1000);
            }
            
            // Add security cameras on lights with interactive labels
            if (i % 30 === 0) {
                const sideCamera = createSecurityCamera();
                sideCamera.position.set(i > 0 ? i - 2 : i + 2, 7.5, 0);
                sideCamera.rotation.y = i > 0 ? -Math.PI/2 : Math.PI/2;
                sideCamera.userData.isInteractive = true;
                sideCamera.userData.description = `Security Camera #${i/30 + 2}`;
                scene.add(sideCamera);
            }
        }
        
        // Enhanced entrance gate with animation
        const gateMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x777777,
            metalness: 0.7,
            roughness: 0.3
        });
        
        const leftGate = new THREE.Mesh(
            new THREE.BoxGeometry(5, 5, 0.5),
            gateMaterial
        );
        leftGate.position.set(-2.5, 2.5, 31);
        leftGate.userData.isGate = true;
        scene.add(leftGate);
        
        const rightGate = leftGate.clone();
        rightGate.position.set(2.5, 2.5, 31);
        scene.add(rightGate);
        
        // Gate control function
        window.openGate = () => {
            gsap.to(leftGate.position, { x: -5, duration: 2, ease: "power2.inOut" });
            gsap.to(rightGate.position, { x: 5, duration: 2, ease: "power2.inOut" });
            
            setTimeout(() => {
                gsap.to(leftGate.position, { x: -2.5, duration: 2, delay: 5, ease: "power2.inOut" });
                gsap.to(rightGate.position, { x: 2.5, duration: 2, delay: 5, ease: "power2.inOut" });
            }, 5000);
        };
        
        // Enhanced security booth with computer screens
        const booth = createSecurityBooth();
        booth.position.set(15, 0, 28);
        booth.userData.isInteractive = true;
        booth.userData.description = "Security Booth";
        scene.add(booth);
        
        // Add parking lot signage
        const addSignage = () => {
            // Stop sign
            const stopSign = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.5, 0.05, 8),
                new THREE.MeshStandardMaterial({ color: 0xff0000 })
            );
            stopSign.position.set(0, 2.5, 25);
            stopSign.rotation.x = Math.PI / 2;
            scene.add(stopSign);
            
            // Add text to sign
            const loader = new THREE.FontLoader();
            loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
                const textGeometry = new THREE.TextGeometry('STOP', {
                    font: font,
                    size: 0.3,
                    height: 0.02,
                    curveSegments: 12
                });
                textGeometry.center();
                
                const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
                const text = new THREE.Mesh(textGeometry, textMaterial);
                text.position.set(0, 2.5, 25.03);
                text.rotation.x = Math.PI / 2;
                scene.add(text);
            });
            
            // Parking information signs
            const infoSign = new THREE.Mesh(
                new THREE.BoxGeometry(3, 2, 0.1),
                new THREE.MeshStandardMaterial({ color: 0x003366 })
            );
            infoSign.position.set(-40, 3, 25);
            scene.add(infoSign);
            
            // Add text to info sign
            loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
                const lines = ['PARKING', 'LOT', 'MAX SPEED', '10 KM/H'];
                
                lines.forEach((line, i) => {
                    const textGeometry = new THREE.TextGeometry(line, {
                        font: font,
                        size: 0.2,
                        height: 0.01,
                        curveSegments: 12
                    });
                    textGeometry.center();
                    
                    const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
                    const text = new THREE.Mesh(textGeometry, textMaterial);
                    text.position.set(-40, 3.5 - (i * 0.4), 25.06);
                    scene.add(text);
                });
            });
        };
        
        addSignage();
        
        // Add decorative elements
        const addDecorations = () => {
            // Trees along perimeter
            const treeGeometry = new THREE.ConeGeometry(2, 5, 8);
            const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x00aa00 });
            
            for (let i = -50; i <= 50; i += 20) {
                const tree = new THREE.Mesh(treeGeometry, treeMaterial);
                tree.position.set(i, 2.5, -35);
                tree.castShadow = true;
                scene.add(tree);
                
                const tree2 = tree.clone();
                tree2.position.set(i, 2.5, 35);
                scene.add(tree2);
            }
            
            // Parking lot poles
            const poleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 6, 16);
            const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
            
            for (let i = -40; i <= 40; i += 20) {
                const pole = new THREE.Mesh(poleGeometry, poleMaterial);
                pole.position.set(i, 3, 0);
                pole.castShadow = true;
                scene.add(pole);
                
                // Add small lights to poles
                const poleLight = new THREE.PointLight(0xffffcc, 0.5, 15);
                poleLight.position.set(i, 5, 0);
                scene.add(poleLight);
            }
        };
        
        addDecorations();
        
        // Add weather effects toggle
        let rainEffect, snowEffect;
        
        window.toggleWeather = (type) => {
            // Remove existing effects
            if (rainEffect) scene.remove(rainEffect);
            if (snowEffect) scene.remove(snowEffect);
            
            if (type === 'rain') {
                rainEffect = new THREE.Group();
                
                // Create rain particles
                const rainCount = 1000;
                const rainGeometry = new THREE.BufferGeometry();
                const positions = new Float32Array(rainCount * 3);
                
                for (let i = 0; i < rainCount; i++) {
                    positions[i * 3] = Math.random() * 120 - 60;
                    positions[i * 3 + 1] = Math.random() * 30 + 10;
                    positions[i * 3 + 2] = Math.random() * 60 - 30;
                }
                
                rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                const rainMaterial = new THREE.PointsMaterial({
                    color: 0xaaaaaa,
                    size: 0.1,
                    transparent: true,
                    opacity: 0.8
                });
                
                const rain = new THREE.Points(rainGeometry, rainMaterial);
                rainEffect.add(rain);
                scene.add(rainEffect);
                
                // Animate rain
                rainEffect.userData.update = () => {
                    const positions = rainGeometry.attributes.position.array;
                    
                    for (let i = 0; i < rainCount; i++) {
                        positions[i * 3 + 1] -= 0.5;
                        
                        if (positions[i * 3 + 1] < -1) {
                            positions[i * 3] = Math.random() * 120 - 60;
                            positions[i * 3 + 1] = Math.random() * 10 + 20;
                            positions[i * 3 + 2] = Math.random() * 60 - 30;
                        }
                    }
                    
                    rainGeometry.attributes.position.needsUpdate = true;
                };
                
            } else if (type === 'snow') {
                snowEffect = new THREE.Group();
                
                // Create snow particles
                const snowCount = 800;
                const snowGeometry = new THREE.BufferGeometry();
                const positions = new Float32Array(snowCount * 3);
                
                for (let i = 0; i < snowCount; i++) {
                    positions[i * 3] = Math.random() * 120 - 60;
                    positions[i * 3 + 1] = Math.random() * 30 + 5;
                    positions[i * 3 + 2] = Math.random() * 60 - 30;
                }
                
                snowGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                const snowMaterial = new THREE.PointsMaterial({
                    color: 0xffffff,
                    size: 0.2,
                    transparent: true,
                    opacity: 0.9
                });
                
                const snow = new THREE.Points(snowGeometry, snowMaterial);
                snowEffect.add(snow);
                scene.add(snowEffect);
                
                // Animate snow
                snowEffect.userData.update = () => {
                    const positions = snowGeometry.attributes.position.array;
                    
                    for (let i = 0; i < snowCount; i++) {
                        positions[i * 3] += (Math.random() - 0.5) * 0.1;
                        positions[i * 3 + 1] -= 0.1;
                        positions[i * 3 + 2] += (Math.random() - 0.5) * 0.1;
                        
                        if (positions[i * 3 + 1] < -1) {
                            positions[i * 3] = Math.random() * 120 - 60;
                            positions[i * 3 + 1] = Math.random() * 10 + 20;
                            positions[i * 3 + 2] = Math.random() * 60 - 30;
                        }
                    }
                    
                    snowGeometry.attributes.position.needsUpdate = true;
                };
            }
        };
    };
    
    // Enhanced security camera model with moving parts
    const createSecurityCamera = () => {
        const cameraGroup = new THREE.Group();
        cameraGroup.userData.isCamera = true;
        
        // Mounting base
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16),
            new THREE.MeshStandardMaterial({ 
                color: 0x222222,
                metalness: 0.8,
                roughness: 0.3
            })
        );
        cameraGroup.add(base);
        
        // Pivot joint
        const pivot = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0x444444 })
        );
        pivot.position.y = 0.15;
        cameraGroup.add(pivot);
        
        // Arm
        const arm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8),
            new THREE.MeshStandardMaterial({ color: 0x444444 })
        );
        arm.position.set(0.4, 0.15, 0);
        arm.rotation.z = Math.PI / 2;
        cameraGroup.add(arm);
        
        // Camera housing
        const housing = new THREE.Group();
        
        // Main body
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.3, 0.3),
            new THREE.MeshStandardMaterial({ 
                color: 0x111111,
                metalness: 0.9,
                roughness: 0.1
            })
        );
        body.position.set(0.8, 0.15, 0);
        housing.add(body);
        
        // Front cover
        const front = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16),
            new THREE.MeshStandardMaterial({ color: 0x333333 })
        );
        front.position.set(0.8, 0.15, 0.15);
        front.rotation.x = Math.PI / 2;
        housing.add(front);
        
        // Lens
        const lens = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, 0.05, 32),
            new THREE.MeshPhysicalMaterial({
                color: 0x0000aa,
                transmission: 0.9,
                roughness: 0.05,
                metalness: 0.5,
                clearcoat: 0.5
            })
        );
        lens.position.set(0.8, 0.15, 0.2);
        lens.rotation.x = Math.PI / 2;
        housing.add(lens);
        
        // Red indicator light
        const indicator = new THREE.PointLight(0xff0000, 0.8, 0.5);
        indicator.position.set(0.8, 0.25, -0.1);
        housing.add(indicator);
        
        // Add housing to camera group
        cameraGroup.add(housing);
        
        // Animation function
        cameraGroup.userData.animate = () => {
            // Smooth pan/tilt motion
            housing.rotation.y = Math.sin(Date.now() * 0.001) * 0.5;
            housing.rotation.x = Math.sin(Date.now() * 0.0007) * 0.3;
            
            // Blinking indicator
            if (Math.sin(Date.now() * 0.005) > 0.9) {
                indicator.intensity = 0.8;
            } else {
                indicator.intensity = 0.2;
            }
        };
        
        return cameraGroup;
    };
    
    // Enhanced security booth model with interior details
    const createSecurityBooth = () => {
        const booth = new THREE.Group();
        
        // Base
        const base = new THREE.Mesh(
            new THREE.BoxGeometry(4, 3, 4),
            new THREE.MeshStandardMaterial({ 
                color: 0x555555,
                metalness: 0.2,
                roughness: 0.6
            })
        );
        base.position.y = 1.5;
        booth.add(base);
        
        // Windows with improved materials
        const windowMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x7ec0ee,
            transmission: 0.85,
            roughness: 0.05,
            metalness: 0.1,
            clearcoat: 0.5,
            clearcoatRoughness: 0.1,
            ior: 1.4
        });
        
        // Front window
        const window = new THREE.Mesh(
            new THREE.BoxGeometry(3.8, 1.5, 0.1),
            windowMaterial
        );
        window.position.set(0, 2.5, 2);
        booth.add(window);
        
        // Side windows
        const sideWindow = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 1.5, 3.8),
            windowMaterial
        );
        sideWindow.position.set(2, 2.5, 0);
        booth.add(sideWindow);
        
        const sideWindow2 = sideWindow.clone();
        sideWindow2.position.set(-2, 2.5, 0);
        booth.add(sideWindow2);
        
        // Roof with improved design
        const roof = new THREE.Mesh(
            new THREE.ConeGeometry(2.5, 1, 4),
            new THREE.MeshStandardMaterial({ 
                color: 0x333333,
                metalness: 0.7,
                roughness: 0.3
            })
        );
        roof.position.y = 4;
        roof.rotation.y = Math.PI / 4;
        booth.add(roof);
        
        // Light on top with flicker
        const light = new THREE.PointLight(0xffaa00, 1.5, 8);
        light.position.set(0, 4.5, 0);
        booth.add(light);
        
        // Add interior details
        const addInterior = () => {
            // Desk
            const desk = new THREE.Mesh(
                new THREE.BoxGeometry(3, 0.8, 2),
                new THREE.MeshStandardMaterial({ color: 0x8B4513 })
            );
            desk.position.set(0, 1, 1.5);
            booth.add(desk);
            
            // Chair
            const chairBase = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 0.1, 0.8),
                new THREE.MeshStandardMaterial({ color: 0x696969 })
            );
            chairBase.position.set(0, 1.1, 0.5);
            booth.add(chairBase);
            
            const chairBack = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 1, 0.1),
                new THREE.MeshStandardMaterial({ color: 0x696969 })
            );
            chairBack.position.set(0, 1.6, 0.9);
            booth.add(chairBack);
            
            // Computer monitors
            const monitorStand = new THREE.Mesh(
                new THREE.BoxGeometry(0.5, 0.1, 0.2),
                new THREE.MeshStandardMaterial({ color: 0x333333 })
            );
            monitorStand.position.set(0.5, 1.8, 1.8);
            booth.add(monitorStand);
            
            const monitorBase = new THREE.Mesh(
                new THREE.BoxGeometry(0.4, 0.3, 0.02),
                new THREE.MeshStandardMaterial({ color: 0x111111 })
            );
            monitorBase.position.set(0.5, 2.1, 1.8);
            booth.add(monitorBase);
            
            // Screen content (simulated)
            const screenContent = new THREE.Mesh(
                new THREE.PlaneGeometry(0.35, 0.25),
                new THREE.MeshBasicMaterial({ 
                    color: 0x00ff00,
                    side: THREE.DoubleSide
                })
            );
            screenContent.position.set(0.5, 2.1, 1.82);
            booth.add(screenContent);
            
            // Add security camera feed to screen
            const renderTarget = new THREE.WebGLRenderTarget(256, 256);
            booth.userData.securityFeed = {
                renderTarget: renderTarget,
                camera: new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
            };
            
            // Position security feed camera
            booth.userData.securityFeed.camera.position.set(0, 8, -31.9);
            booth.userData.securityFeed.camera.rotation.y = Math.PI;
            
            // Update screen content periodically
            setInterval(() => {
                // Render security view to texture
                renderer.setRenderTarget(renderTarget);
                renderer.render(scene, booth.userData.securityFeed.camera);
                renderer.setRenderTarget(null);
                
                // Apply to screen
                screenContent.material.map = renderTarget.texture;
                screenContent.material.needsUpdate = true;
            }, 100);
            
            // Second monitor
            const monitor2 = monitorBase.clone();
            monitor2.position.set(-0.5, 2.1, 1.8);
            booth.add(monitor2);
            
            const screenContent2 = screenContent.clone();
            screenContent2.position.set(-0.5, 2.1, 1.82);
            screenContent2.material = new THREE.MeshBasicMaterial({ 
                color: 0x0000ff,
                side: THREE.DoubleSide
            });
            booth.add(screenContent2);
        };
        
        addInterior();
        
        return booth;
    };
    
    // Advanced car model with more realistic details
    const createCar = (color = 0x0066cc) => {
        const car = new THREE.Group();
        car.userData.isVehicle = true;
        
        // Main body
        const bodyGeometry = new THREE.BoxGeometry(4.2, 1.5, 2.2);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.2,
            metalness: 0.8,
            clearcoat: 0.5,
            clearcoatRoughness: 0.1
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        car.add(body);
        
        // Windows with improved glass material
        const windowGeometry = new THREE.BoxGeometry(3.8, 0.8, 1.9);
        const windowMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x222222,
            transmission: 0.85,
            roughness: 0.05,
            metalness: 0.3,
            clearcoat: 0.5,
            ior: 1.5,
            thickness: 0.5
        });
        const windows = new THREE.Mesh(windowGeometry, windowMaterial);
        windows.position.y = 0.9;
        car.add(windows);
        
        // Front and rear details with more complexity
        const frontGeometry = new THREE.BufferGeometry();
        const frontVertices = new Float32Array([
            // Front face
            2.1, 0.75, 1.1,   // top right
            2.1, -0.75, 1.1,  // bottom right
            2.35, -0.4, 1.1,  // bottom middle right
            2.35, 0.4, 1.1,   // top middle right
            
            // Rear face
            -2.1, 0.75, 1.1,   // top right
            -2.1, -0.75, 1.1,  // bottom right
            -2.35, -0.4, 1.1,  // bottom middle right
            -2.35, 0.4, 1.1    // top middle right
        ]);
        frontGeometry.setAttribute('position', new THREE.BufferAttribute(frontVertices, 3));
        frontGeometry.setIndex([
            0, 1, 3,   // first triangle
            1, 2, 3,   // second triangle
            4, 5, 7,   // first triangle (rear)
            5, 6, 7    // second triangle (rear)
        ]);
        
        const frontMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x111111,
            roughness: 0.3,
            metalness: 0.9
        });
        const front = new THREE.Mesh(frontGeometry, frontMaterial);
        car.add(front);
        
        // Mirror the front to create the back
        const back = front.clone();
        back.rotation.y = Math.PI;
        car.add(back);
        
        // Wheels with more realistic design
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32);
        const wheelMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x222222,
            roughness: 0.4,
            metalness: 0.8
        });
        
        const wheelTireGeometry = new THREE.TorusGeometry(0.4, 0.1, 16, 32);
        const wheelTireMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x111111,
            roughness: 0.7,
            metalness: 0.1
        });
        
        const wheelRimGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.32, 16);
        const wheelRimMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xaaaaaa,
            roughness: 0.2,
            metalness: 0.9
        });
        
        const wheelPositions = [
            { x: 1.3, y: -0.5, z: 1.1 },
            { x: -1.3, y: -0.5, z: 1.1 },
            { x: 1.3, y: -0.5, z: -1.1 },
            { x: -1.3, y: -0.5, z: -1.1 }
        ];
        
        wheelPositions.forEach(pos => {
            // Wheel assembly group
            const wheelGroup = new THREE.Group();
            wheelGroup.position.set(pos.x, pos.y, pos.z);
            wheelGroup.rotation.z = Math.PI / 2;
            
            // Tire
            const tire = new THREE.Mesh(wheelTireGeometry, wheelTireMaterial);
            wheelGroup.add(tire);
            
            // Rim
            const rim = new THREE.Mesh(wheelRimGeometry, wheelRimMaterial);
            wheelGroup.add(rim);
            
            // Wheel cover
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheelGroup.add(wheel);
            
            car.add(wheelGroup);
        });
        
        // Headlights with actual light sources
        const headlightGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const headlightMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffcc,
            emissive: 0xffffcc,
            emissiveIntensity: 0.5
        });
        
        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.position.set(2.2, 0.3, 0.7);
        car.add(leftHeadlight);
        
        const rightHeadlight = leftHeadlight.clone();
        rightHeadlight.position.set(2.2, 0.3, -0.7);
        car.add(rightHeadlight);
        
        // Actual light sources
        const leftHeadlightLight = new THREE.SpotLight(0xffffcc, 2, 20, Math.PI/6, 0.5);
        leftHeadlightLight.position.set(2.3, 0.3, 0.7);
        leftHeadlightLight.target.position.set(10, 0.3, 0.7);
        leftHeadlightLight.castShadow = true;
        car.add(leftHeadlightLight);
        car.add(leftHeadlightLight.target);
        
        const rightHeadlightLight = leftHeadlightLight.clone();
        rightHeadlightLight.position.set(2.3, 0.3, -0.7);
        rightHeadlightLight.target.position.set(10, 0.3, -0.7);
        car.add(rightHeadlightLight);
        car.add(rightHeadlightLight.target);
        
        // Brake lights with illumination
        const brakeLightMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.3
        });
        
        const leftBrakeLight = new THREE.Mesh(headlightGeometry, brakeLightMaterial);
        leftBrakeLight.position.set(-2.2, 0.3, 0.7);
        car.add(leftBrakeLight);
        
        const rightBrakeLight = leftBrakeLight.clone();
        rightBrakeLight.position.set(-2.2, 0.3, -0.7);
        car.add(rightBrakeLight);
        
        // Actual brake light sources
        car.userData.brakeLights = [
            new THREE.PointLight(0xff0000, 0, 5),
            new THREE.PointLight(0xff0000, 0, 5)
        ];
        
        car.userData.brakeLights[0].position.set(-2.3, 0.3, 0.7);
        car.userData.brakeLights[1].position.set(-2.3, 0.3, -0.7);
        car.add(car.userData.brakeLights[0]);
        car.add(car.userData.brakeLights[1]);
        
        // License plate
        const plateGeometry = new THREE.PlaneGeometry(0.8, 0.2);
        const plateMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            metalness: 0.1,
            roughness: 0.5
        });
        const licensePlate = new THREE.Mesh(plateGeometry, plateMaterial);
        licensePlate.position.set(-2.35, -0.3, 0);
        licensePlate.rotation.y = Math.PI;
        car.add(licensePlate);
        
        // License plate text
        const loader = new THREE.FontLoader();
        loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            const textGeometry = new THREE.TextGeometry('ABC-123', {
                font: font,
                size: 0.1,
                height: 0.01
            });
            textGeometry.center();
            
            const textMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
            const text = new THREE.Mesh(textGeometry, textMaterial);
            text.position.set(-2.36, -0.3, 0);
            text.rotation.y = Math.PI;
            car.add(text);
        });
        
        // Side mirrors
        const mirrorGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.05);
        const mirrorMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.9,
            roughness: 0.1
        });
        
        const leftMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
        leftMirror.position.set(1.8, 0.8, 1.1);
        car.add(leftMirror);
        
        const rightMirror = leftMirror.clone();
        rightMirror.position.set(1.8, 0.8, -1.1);
        car.add(rightMirror);
        
        // Door handles
        const handleGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.05);
        const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
        
        const leftHandle = new THREE.Mesh(handleGeometry, handleMaterial);
        leftHandle.position.set(1.5, 0.5, 1.05);
        car.add(leftHandle);
        
        const rightHandle = leftHandle.clone();
        rightHandle.position.set(1.5, 0.5, -1.05);
        car.add(rightHandle);
        
        return car;
    };
    
    // Create multiple cars with different models
    const mainCar = createCar(0x0066cc);
    mainCar.position.set(-60, 0.75, 0);
    mainCar.castShadow = true;
    scene.add(mainCar);
    
    // Add parked cars with different types
    const parkedCars = [];
    const carColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
    
    for (let i = 0; i < 5; i++) {
        const parkedCar = createCar(carColors[i]);
        parkedCar.position.set(
            -40 + (i * 20),
            0.75,
            (i % 2 === 0) ? -5 : 5
        );
        parkedCar.rotation.y = (i % 2 === 0) ? Math.PI / 2 : -Math.PI / 2;
        
        // Make some cars different sizes
        if (i === 2) parkedCar.scale.set(1.2, 1.2, 1.2); // SUV
        if (i === 4) parkedCar.scale.set(0.8, 0.8, 0.8); // Compact car
        
        scene.add(parkedCar);
        parkedCars.push(parkedCar);
    }
    
    // Add a truck for variety
    const createTruck = () => {
        const truck = new THREE.Group();
        
        // Cab
        const cabGeometry = new THREE.BoxGeometry(3, 2.5, 2.5);
        const cabMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
        const cab = new THREE.Mesh(cabGeometry, cabMaterial);
        cab.position.set(0, 1.25, 0);
        truck.add(cab);
        
        // Trailer
        const trailerGeometry = new THREE.BoxGeometry(5, 2.5, 2.5);
        const trailer = new THREE.Mesh(trailerGeometry, cabMaterial);
        trailer.position.set(-3.5, 1.25, 0);
        truck.add(trailer);
        
        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 32);
        const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
        
        const wheelPositions = [
            { x: 1.5, y: -0.5, z: 1.3 },
            { x: -1.5, y: -0.5, z: 1.3 },
            { x: -4, y: -0.5, z: 1.3 },
            { x: 1.5, y: -0.5, z: -1.3 },
            { x: -1.5, y: -0.5, z: -1.3 },
            { x: -4, y: -0.5, z: -1.3 }
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.set(pos.x, pos.y, pos.z);
            wheel.rotation.z = Math.PI / 2;
            truck.add(wheel);
        });
        
        return truck;
    };
    
    const deliveryTruck = createTruck();
    deliveryTruck.position.set(30, 1.25, 10);
    deliveryTruck.rotation.y = Math.PI;
    scene.add(deliveryTruck);
    parkedCars.push(deliveryTruck);
    
    // Parking spots with better distribution and smart detection
    const spotGeometry = new THREE.BoxGeometry(4.5, 0.1, 2.8);
    const spotMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4CAF50,
        transparent: true,
        opacity: 0.7,
        emissive: 0x4CAF50,
        emissiveIntensity: 0.1
    });
    
    const spots = [];
    for (let i = -15; i <= 15; i += 6) {
        for (let j = -50; j <= 50; j += 10) {
            if (Math.abs(j) < 45 || Math.abs(i) > 3) { // Avoid spots near entrance
                const spot = new THREE.Mesh(spotGeometry, spotMaterial.clone());
                spot.position.set(j, 0.11, i);
                spot.userData = {
                    occupied: false,
                    reserved: false,
                    special: Math.random() < 0.1 // 10% are special spots
                };
                
                if (spot.userData.special) {
                    spot.material.color.setHex(0xFFC107); // Yellow for special spots
                    spot.material.emissive.setHex(0xFFC107);
                    
                    // Add handicap symbol
                    const symbol = new THREE.Mesh(
                        new THREE.PlaneGeometry(0.8, 0.8),
                        new THREE.MeshBasicMaterial({
                            color: 0x000000,
                            transparent: true,
                            opacity: 0.8,
                            side: THREE.DoubleSide
                        })
                    );
                    symbol.position.set(j, 0.12, i);
                    symbol.rotation.x = -Math.PI / 2;
                    scene.add(symbol);
                }
                
                spot.visible = false;
                scene.add(spot);
                spots.push(spot);
            }
        }
    }
    
    // Mark spots as occupied based on parked cars
    parkedCars.forEach((car, index) => {
        const nearbySpots = spots.filter(spot => 
            Math.abs(spot.position.x - car.position.x) < 5 && 
            Math.abs(spot.position.z - car.position.z) < 5
        );
        
        if (nearbySpots.length > 0) {
            nearbySpots[0].userData.occupied = true;
            nearbySpots[0].material.color.setHex(0xFF5722);
            nearbySpots[0].material.emissive.setHex(0xFF5722);
        }
    });
    
    // Camera setup with dynamic following and smooth transitions
    camera.position.set(-30, 8, 10);
    camera.lookAt(mainCar.position);
    
    // Animation variables
    let carMoving = true;
    let carPosition = -60;
    let carSpeed = 0.1;
    let targetSpot = null;
    let animationState = 'moving';
    let wheelRotation = 0;
    let currentCamera = 'follow';
    let cameraTransition = false;
    
    // Enhanced car animation with better physics and controls
    const animateCar = () => {
        if (!carMoving) return;
        
        // Rotate wheels based on speed
        wheelRotation += carSpeed * 0.5;
        mainCar.children.forEach((child, index) => {
            if (child instanceof THREE.Group && child.children.length > 0) { // Wheel groups
                child.rotation.x = wheelRotation;
            }
        });
        
        if (animationState === 'moving') {
            if (carPosition < 60) {
                carPosition += carSpeed;
                mainCar.position.x = carPosition;
                
                // Gentle movement for realism
                mainCar.position.z = Math.sin(carPosition * 0.1) * 0.5;
                mainCar.position.y = 0.75 + Math.sin(Date.now() * 0.01) * 0.02;
                
                // Brake lights when slowing down
                if (carSpeed < 0.08) {
                    mainCar.userData.brakeLights.forEach(light => {
                        light.intensity = 1;
                    });
                } else {
                    mainCar.userData.brakeLights.forEach(light => {
                        light.intensity = 0;
                    });
                }
                
                // Update camera based on current view
                updateCamera();
            } else {
                carPosition = -60;
            }
        } 
        else if (animationState === 'parking' && targetSpot) {
            const targetPos = targetSpot.position.clone();
            targetPos.y = 0.75;
            
            const distance = mainCar.position.distanceTo(targetPos);
            const direction = new THREE.Vector3().subVectors(targetPos, mainCar.position).normalize();
            
            if (distance > 0.5) {
                // Adaptive speed based on distance
                carSpeed = Math.min(0.08, distance * 0.1);
                
                // Smooth parking maneuver with better turning
                mainCar.position.add(direction.multiplyScalar(carSpeed));
                
                // Calculate target rotation
                const targetAngle = Math.atan2(
                    targetPos.x - mainCar.position.x,
                    targetPos.z - mainCar.position.z
                );
                
                // Smooth rotation
                mainCar.rotation.y = THREE.MathUtils.lerp(
                    mainCar.rotation.y,
                    targetAngle,
                    0.1
                );
                
                // Brake lights when parking
                mainCar.userData.brakeLights.forEach(light => {
                    light.intensity = 1;
                });
                
                // Update camera
                updateCamera();
            } else {
                animationState = 'parked';
                targetSpot.userData.occupied = true;
                carSpeed = 0;
                
                // Show parking complete notification
                showNotification('Parking complete!', 'success');
                
                // After delay, continue driving
                setTimeout(() => {
                    animationState = 'moving';
                    targetSpot.material.color.setHex(0xFF5722);
                    targetSpot.material.emissive.setHex(0xFF5722);
                    targetSpot = null;
                    carSpeed = 0.1;
                }, 3000);
            }
        }
    };
    
    // Camera update function with smooth transitions
    const updateCamera = () => {
        if (cameraTransition) return;
        
        if (currentCamera === 'follow') {
            const targetPos = new THREE.Vector3().copy(mainCar.position).add(new THREE.Vector3(-8, 5, 8));
            cameras.follow.position.lerp(targetPos, 0.1);
            cameras.follow.lookAt(mainCar.position.x, mainCar.position.y + 1, mainCar.position.z);
        } else if (currentCamera === 'driver') {
            cameras.driver.position.set(
                mainCar.position.x - 2 * Math.sin(mainCar.rotation.y),
                mainCar.position.y + 1.5,
                mainCar.position.z - 2 * Math.cos(mainCar.rotation.y)
            );
            cameras.driver.rotation.y = mainCar.rotation.y;
            cameras.driver.rotation.x = 0;
        } else if (currentCamera === 'security') {
            // Security camera view doesn't need updates
        }
    };
    
    // Smooth camera transition
    const transitionCamera = (newCamera) => {
        if (currentCamera === newCamera || cameraTransition) return;
        
        cameraTransition = true;
        const oldCamera = cameras[currentCamera];
        const targetCamera = cameras[newCamera];
        
        // Create a temporary camera for transition
        const tempCamera = oldCamera.clone();
        scene.add(tempCamera);
        
        // Animate transition
        const duration = 1.0;
        const startTime = Date.now();
        
        const animateTransition = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            
            // Interpolate position and rotation
            tempCamera.position.lerpVectors(oldCamera.position, targetCamera.position, progress);
            
            // Create a temp target for lookAt
            const tempTarget = new THREE.Vector3();
            tempTarget.lerpVectors(
                oldCamera.position.clone().add(oldCamera.getWorldDirection(new THREE.Vector3())),
                targetCamera.position.clone().add(targetCamera.getWorldDirection(new THREE.Vector3())),
                progress
            );
            
            tempCamera.lookAt(tempTarget);
            
            // Render with temp camera
            renderer.render(scene, tempCamera);
            
            if (progress < 1) {
                requestAnimationFrame(animateTransition);
            } else {
                scene.remove(tempCamera);
                currentCamera = newCamera;
                cameraTransition = false;
            }
        };
        
        animateTransition();
    };
    
    // Spot selection with visual feedback and validation
    const selectSpot = (spot) => {
        if (spot.userData.occupied) {
            showNotification('This spot is already occupied!', 'error');
            return;
        }
        
        if (spot.userData.reserved) {
            showNotification('This spot is reserved!', 'error');
            return;
        }
        
        if (spot.userData.special) {
            showNotification('Special spot selected - valid permit required', 'warning');
        }
        
        spots.forEach(s => {
            s.material.color.setHex(s.userData.occupied ? 0xFF5722 : 
                                  s.userData.special ? 0xFFC107 : 0x4CAF50);
            s.material.emissive.setHex(s.userData.occupied ? 0xFF5722 : 
                                      s.userData.special ? 0xFFC107 : 0x4CAF50);
        });
        
        spot.material.color.setHex(0x2196F3);
        spot.material.emissive.setHex(0x2196F3);
        targetSpot = spot;
        animationState = 'parking';
        
        showNotification('Navigating to selected spot...', 'info');
    };
    
    // Enhanced notification system
    const showNotification = (message, type) => {
        const notifications = document.getElementById('notifications');
        
        // Clear existing notifications of the same type
        document.querySelectorAll(`.notification.${type}`).forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Add appropriate icon
        let icon = '';
        switch(type) {
            case 'success': icon = '✓'; break;
            case 'error': icon = '✗'; break;
            case 'warning': icon = '⚠'; break;
            case 'info': icon = 'ℹ'; break;
        }
        
        notification.innerHTML = `<span class="icon">${icon}</span><span class="message">${message}</span>`;
        notifications.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    };
    
    // Advanced raycasting for interactive elements
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const onMouseClick = (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / (window.innerHeight * 0.6)) * 2 + 1;
        
        raycaster.setFromCamera(mouse, cameras[currentCamera]);
        
        // Check for interactive objects first
        const interactiveObjects = [];
        scene.traverse(obj => {
            if (obj.userData.isInteractive) interactiveObjects.push(obj);
        });
        
        const interactiveIntersects = raycaster.intersectObjects(interactiveObjects);
        
        if (interactiveIntersects.length > 0) {
            const obj = interactiveIntersects[0].object;
            showNotification(`Clicked: ${obj.userData.description}`, 'info');
            
            // Special actions for specific objects
            if (obj.userData.description.includes('Security Camera')) {
                // Switch to security camera view
                transitionCamera('security');
            }
            
            return;
        }
        
        // Check for parking spots
        const spotIntersects = raycaster.intersectObjects(spots);
        
        if (spotIntersects.length > 0) {
            selectSpot(spotIntersects[0].object);
        }
    };
    
    renderer.domElement.addEventListener('click', onMouseClick);
    
    // Animation loop with additional effects
    const animate = () => {
        requestAnimationFrame(animate);
        
        // Main car animation
        animateCar();
        
        // Animate security cameras
        scene.traverse(obj => {
            if (obj.userData.isCamera && obj.userData.animate) {
                obj.userData.animate();
            }
        });
        
        // Animate weather effects
        scene.traverse(obj => {
            if (obj.userData.update) {
                obj.userData.update();
            }
        });
        
        // Render from current camera
        if (!cameraTransition) {
            renderer.render(scene, cameras[currentCamera]);
        }
        
        // Update headlights to follow car direction
        if (mainCar.children.length > 0) {
            const headlightIndex = mainCar.children.length - 4; // Assuming headlights are last
            if (mainCar.children[headlightIndex] instanceof THREE.SpotLight) {
                const dir = new THREE.Vector3();
                mainCar.getWorldDirection(dir);
                
                mainCar.children[headlightIndex].target.position.copy(
                    mainCar.position.clone().add(dir.multiplyScalar(10))
                );
                mainCar.children[headlightIndex + 1].target.position.copy(
                    mainCar.position.clone().add(dir.multiplyScalar(10))
                );
            }
        }
    };
    
    animate();
    
    // Responsive handling
    window.addEventListener('resize', () => {
        const aspect = window.innerWidth / (window.innerHeight * 0.6);
        Object.values(cameras).forEach(cam => {
            cam.aspect = aspect;
            cam.updateProjectionMatrix();
        });
        renderer.setSize(window.innerWidth, window.innerHeight * 0.6);
    });
    
    // Control panel enhancements
    document.getElementById('toggle-animation').addEventListener('click', function() {
        carMoving = !carMoving;
        this.innerHTML = carMoving ? '<i class="fas fa-pause"></i> Pause' : '<i class="fas fa-play"></i> Play';
    });
    
    document.getElementById('toggle-spots').addEventListener('click', function() {
        spots.forEach(spot => {
            spot.visible = !spot.visible;
        });
        this.innerHTML = spots[0].visible ? 
            '<i class="fas fa-eye-slash"></i> Hide Spots' : 
            '<i class="fas fa-eye"></i> Show Spots';
    });
    
    document.getElementById('camera-follow').addEventListener('click', function() {
        transitionCamera('follow');
        updateCameraButtons();
    });
    
    document.getElementById('camera-overhead').addEventListener('click', function() {
        transitionCamera('overhead');
        updateCameraButtons();
    });
    
    document.getElementById('camera-driver').addEventListener('click', function() {
        transitionCamera('driver');
        updateCameraButtons();
    });
    
    document.getElementById('camera-security').addEventListener('click', function() {
        transitionCamera('security');
        updateCameraButtons();
    });
    
    document.getElementById('open-gate').addEventListener('click', function() {
        window.openGate();
    });
    
    document.getElementById('weather-clear').addEventListener('click', function() {
        window.toggleWeather('none');
    });
    
    document.getElementById('weather-rain').addEventListener('click', function() {
        window.toggleWeather('rain');
    });
    
    document.getElementById('weather-snow').addEventListener('click', function() {
        window.toggleWeather('snow');
    });
    
    const updateCameraButtons = () => {
        document.getElementById('camera-follow').classList.toggle('active', currentCamera === 'follow');
        document.getElementById('camera-overhead').classList.toggle('active', currentCamera === 'overhead');
        document.getElementById('camera-driver').classList.toggle('active', currentCamera === 'driver');
        document.getElementById('camera-security').classList.toggle('active', currentCamera === 'security');
    };
    
    // Enhanced security alarm system
    const checkSecurityViolations = () => {
        // Check if car is going too fast
        if (animationState === 'moving' && carMoving && carSpeed > 0.15) {
            showNotification('Security Alert: Speed violation detected!', 'warning');
            
            // Flash lights and sound alarm
            const alarmLight = new THREE.PointLight(0xff0000, 5, 20);
            alarmLight.position.set(mainCar.position.x, 5, 0);
            scene.add(alarmLight);
            
            // Play alarm sound
            if (window.AlarmSound) {
                window.AlarmSound.play();
            }
            
            setTimeout(() => {
                scene.remove(alarmLight);
            }, 1000);
        }
        
        // Check for wrong-way driving
        if (mainCar.position.z < -10 || mainCar.position.z > 10) {
            showNotification('Security Alert: Vehicle outside designated lanes!', 'error');
        }
        
        // Check for parking in special spots without permission
        if (targetSpot && targetSpot.userData.special && animationState === 'parked') {
            setTimeout(() => {
                showNotification('Security Alert: Unauthorized parking in special spot!', 'error');
            }, 2000);
        }
    };
    
    // Run security checks periodically
    setInterval(checkSecurityViolations, 1000);
    
    // Initialize environment
    addEnvironment();
    updateCameraButtons();
    
    // Auto-start the animation
    document.getElementById('toggle-animation').innerHTML = '<i class="fas fa-pause"></i> Pause';
    
    // Load alarm sound
    window.AlarmSound = new Howl({
        src: ['https://assets.codepen.io/3364143/alarm.mp3'],
        volume: 0.5
    });
};

// Initialize when page loads
window.addEventListener('load', initParkingScene);