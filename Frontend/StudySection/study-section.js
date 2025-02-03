import * as THREE from "three";
import { GLTFLoader } from "jsm/loaders/GLTFLoader.js";
// import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { gsap } from './node_modules/gsap/index.js';

class InteractiveThreeScene {
    constructor() {
        // Scene setup
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.scene = new THREE.Scene();
        this.camera = this.setupCamera();
        this.renderer = this.setupRenderer();
        this.buttonGroup = new THREE.Group();

        // Mouse interaction variables
        this.isDragging = false;
        this.previousMouseX = this.width / 2;
        this.previousMouseY = this.height / 2;

        // Animation and interaction settings
        this.rotationSpeed = 0.05;
        this.targetRotationX = 0;
        this.targetRotationY = 0;

        // Landmark positions for zoom
        this.landmarkPositions = {
            eye: { pos: [0, -1, 2], rot: [0, 0, 0] },
            jaw: { pos: [-0.5, 0.7, 1.3], rot: [0, 7, 0] },
            cheekBone: { pos: [-0.5, 0.7, 1.3], rot: [0, -0.5, 0] },
            nose: { pos: [0, 0, 2], rot: [0, 5, 0] },
            lips: { pos: [0, 0.7, 2], rot: [0.3, 0, 0] }
        };

        this.init();
    }

    setupCamera() {
        const camera = new THREE.PerspectiveCamera(
            75, 
            this.width / this.height, 
            0.1, 
            1000
        );
        camera.position.z = 5;
        return camera;
    }

    setupRenderer() {
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(this.width, this.height);
        const container = document.getElementById('scene-container');
        container.appendChild(renderer.domElement);
        return renderer;
    }

    createLandmarkMesh(color = 0xffffff) {
        const geometry = new THREE.SphereGeometry(0.05, 32, 16);
        const material = new THREE.MeshBasicMaterial({ color });
        return new THREE.Mesh(geometry, material);
    }

    setupLandmarks() {
        const landmarks = [
            { name: 'eye', pos: [-0.5, 0.7, 1.3], color: 0xffffff },
            { name: 'jaw', pos: [-0.95, -0.22, 0.5], color: 0xffffff },
            { name: 'cheekBone', pos: [-1.05, 0.55, 0.8], color: 0xffffff },
            { name: 'nose', pos: [0, 0.2, 1.75], color: 0xffffff },
            { name: 'lips', pos: [0, -0.33, 1.55], color: 0xffffff }
        ];

        landmarks.forEach(landmark => {
            const mesh = this.createLandmarkMesh(landmark.color);
            mesh.position.set(...landmark.pos);
            mesh.name = landmark.name; // Adding a name for identification
            mesh.userData.isLandmark = true; // Adding a flag for click detection
            this.buttonGroup.add(mesh);
        });
    }

    setupEventListeners() {
        this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.renderer.domElement.addEventListener('mouseleave', this.onMouseUp.bind(this));
        this.renderer.domElement.addEventListener('click', this.onMouseClick.bind(this));
        window.addEventListener('resize', this.onResize.bind(this));
    }

    loadModel() {
        const loader = new GLTFLoader();
        loader.load(
            'scene.gltf', 
            (gltf) => {
                gltf.scene.position.y = -3;
                gltf.scene.scale.set(150, 150, 150);
                this.buttonGroup.add(gltf.scene);
                this.scene.add(this.buttonGroup);
                this.buttonGroup.position.x = 4;
            },
            undefined,
            (error) => console.error('Error loading model:', error)
        );
    }

    init() {
        // Setup scene elements
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x343a40);
        this.scene.add(hemiLight);

        this.setupLandmarks();
        this.loadModel();
        this.setupEventListeners();
        this.animate();
    }

    zoomToLandmark(landmarkName) {
        const targetPos = this.landmarkPositions[landmarkName];
        
        // Animate camera and rotation
        gsap.timeline()
            .to(this.buttonGroup.position, {
                x: targetPos.pos[0],
                y: targetPos.pos[1],
                z: targetPos.pos[2],
                duration: 1,
                ease: 'power2.inOut'
            })
            .to(this.buttonGroup.rotation, {
                x: targetPos.rot[0],
                y: targetPos.rot[1],
                z: targetPos.rot[2],
                duration: 1,
                ease: 'power2.inOut'
            }, 0); // continuous animation
    }


    onMouseClick(event) {
        // Raycaster for detecting clicked landmark
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(
            (event.clientX / this.width) * 2 - 1,
            -(event.clientY / this.height) * 2 + 1
        );

        raycaster.setFromCamera(mouse, this.camera);
        const intersects = raycaster.intersectObjects(this.buttonGroup.children);

        // Check if a landmark was clicked
        const clickedLandmark = intersects.find(
            intersect => intersect.object.userData.isLandmark
        );

        if (clickedLandmark) {
            const landmarkName = clickedLandmark.object.name;
            this.zoomToLandmark(landmarkName);
        }
    }

    onMouseDown(e) {
        this.isDragging = true;
        this.previousMouseX = e.clientX;
        this.previousMouseY = e.clientY;
    }

    onMouseMove(e) {
        if (this.isDragging) {
            // Use GSAP for smoother, more controlled rotation
            gsap.to(this.buttonGroup.rotation, {
                y: -3 + (e.clientX / this.width * 3),
                x: -1.2 + (e.clientY * 2.5 / this.height),
                duration: 0.5,
                ease: 'power1.out'
            });

            this.previousMouseX = e.clientX;
            this.previousMouseY = e.clientY;
        }
    }

    onMouseUp() {
        this.isDragging = false;
    }

    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(this.width, this.height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the scene
const scene = new InteractiveThreeScene();