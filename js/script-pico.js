
//import * as THREE from '../build/three.module.js';

//import { OutlineEffect } from './jsm/effects/OutlineEffect.js';
//import { MMDLoader } from './jsm/loaders/MMDLoader.js';
//import { MMDAnimationHelper } from './jsm/animation/MMDAnimationHelper.js';

let mesh, camera, scene, renderer, effect, composer;
let helper;

let ready = false;

const clock = new THREE.Clock();

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', () => {
    Ammo().then(() => {
        init();
        // setupPhysicsWorld();
        animate();
    });
});

function setupPhysicsWorld(){
    let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache    = new Ammo.btDbvtBroadphase(),
        solver                  = new Ammo.btSequentialImpulseConstraintSolver();

    let physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
}

function initLoadingManager() {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const id = setInterval(frame, 10);
    let width = 0;
    let percentComplete = 0;

    function frame() {
        if (width < percentComplete) {
            width += 1;
            progressBar.style.width = width + '%';
            progressText.textContent = width;
        } else if (width >= 100) {
            document.getElementById('overlay').remove();
            clearInterval(id)
            ready = true;
        }
    }

    const manager = new THREE.LoadingManager();

    manager.onStart = (url, itemsLoaded, itemsTotal) => {
        document.getElementById('startButton').remove();
        document.getElementById('loadingContainer').classList.remove('none');
        console.log(`Started loading file: ${url}.\nLoaded ${itemsLoaded} of ${itemsTotal} files.`);
    };

    manager.onLoad = () => {
        console.log('Loading complete!');
    };

    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
        percentComplete = Math.round((itemsLoaded / itemsTotal * 100 + Number.EPSILON) * 100) / 100;
        console.log(`Loading file: ${url}.\nLoaded ${itemsLoaded} of ${itemsTotal} files.`);
    };

    return manager;
}

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    // Scene

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);

    // Camera

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(0, 3, 45);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(camera);

    // Renderer

    renderer = new THREE.WebGLRenderer({antialias: true});
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    // renderer.autoClear = false;
    // renderer.preserveDrawingBuffer = true;

    // Orbit controls

    const controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Ground

    const planeGeom = new THREE.PlaneBufferGeometry(50, 50);
    const planePosY = -0.001;
    const planeRotX = -Math.PI / 2;

    // Solid plane
    let solidPlane = new THREE.Mesh(
        planeGeom,
        new THREE.MeshPhongMaterial({color: 0xffc0cb})
    );
    solidPlane.position.y = planePosY;
    solidPlane.rotation.x = planeRotX;
    solidPlane.receiveShadow = true;
    scene.add(solidPlane);

    // // Mirror plane
    // let mirrorPlane = new THREE.Reflector(planeGeom, {
    //     clipBias: 0.003,
    //     textureWidth: window.innerWidth * window.devicePixelRatio,
    //     textureHeight: window.innerHeight * window.devicePixelRatio,
    //     color: 0x777777
    // });
    // mirrorPlane.position.y = planePosY;
    // mirrorPlane.rotation.x = planeRotX;
    // // mirrorPlane.rotateX(-Math.PI / 2);
    // scene.add(mirrorPlane);

    // Grid plane
    // scene.add(new THREE.GridHelper(100, 10));

    // TODEL
    let geo = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    const cube = new THREE.Mesh( geo, material );
    cube.castShadow = true;
    cube.position.set(0, 10, 20);
    scene.add( cube );

    // Light

    // const ambient = new THREE.AmbientLight(0x999999);
    // scene.add(ambient);

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, 25, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    // scene.add(new THREE.DirectionalLightHelper(directionalLight))
    // scene.add(new THREE.CameraHelper(directionalLight.camera))

    // Model

    function onProgress(xhr) {
        if (xhr.lengthComputable) {
            const percentComplete = xhr.loaded / xhr.total * 100;
            // console.log(Math.round(percentComplete) + '% downloaded');
        }
    }

    const selects = [];
    const manager = initLoadingManager();
    const modelFile = 'res/models/klee/klee.pmx';
    // const vmdFiles = ['res/mmd/vmds/wavefile_v2.vmd'];
    // const cameraFiles = ['res/mmd/vmds/wavefile_camera.vmd'];
    // const audioFile = 'res/mmd/audios/wavefile_short.mp3';
    // const audioParams = {delayTime: 160 * 1 / 30};
    const modelFile2 = 'res/models/qiqi/qiqi.pmx';
    const modelFile3 = 'res/models/diona/diona.pmx';
    const vmdFiles1 = ['res/audio-mc/pico/Motion-Camera/MIDDLE.vmd'];
    const vmdFiles2 = ['res/audio-mc/pico/Motion-Camera/LEFT.vmd'];
    const vmdFiles3 = ['res/audio-mc/pico/Motion-Camera/RIGHT.vmd'];
    const cameraFiles = ['res/audio-mc/pico/Motion-Camera/camera.vmd'];
    const audioFile = 'res/audio-mc/pico/audios/pico.mp3';
    const audioParams = {};
    const listener = new THREE.AudioListener();
    camera.add(listener);

    helper = new THREE.MMDAnimationHelper({pmxAnimation: true});
    const loader = new THREE.MMDLoader(manager);
    const audioLoader = new THREE.AudioLoader(manager);

    function loadModel(modelFile, vmdFiles) {
        loader.loadWithAnimation(modelFile, vmdFiles, (mmd) => {
            mesh = mmd.mesh;
            mesh.scale.set(1, 1, 1);
            mesh.castShadow = true;
            for (let material of mesh.material) {
                material.userData.outlineParameters.thickness = 0.001;
            }
            helper.add(mesh, {
                animation: mmd.animation,
                physics: true
            });
            scene.add(mesh);
            selects.push(mesh);
        }, onProgress, null);
    }

    loadModel(modelFile, vmdFiles1);
    loadModel(modelFile2, vmdFiles2);
    loadModel(modelFile3, vmdFiles3);

    // loader.loadAnimation(cameraFiles, camera, (cameraAnimation) => {
    //     helper.add(camera, {animation: cameraAnimation});
    // }, onProgress, null);

    audioLoader.load(audioFile, (buffer) => {
        const audio = new THREE.Audio(listener).setBuffer(buffer);
        helper.add(audio, audioParams);
    }, onProgress, null);

    // Effect

    // renderer.outputEncoding = THREE.sRGBEncoding;
    effect = new THREE.OutlineEffect(renderer);

    // Post-processing

    composer = new THREE.EffectComposer(renderer);
    // composer.renderToScreen = false;

    // let geometry = new THREE.PlaneBufferGeometry(50, 50);
    let groundReflector = new THREE.ReflectorForSSRPass(planeGeom, {
        clipBias: 0.0003,
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio,
        // color: 0xffffff,
        color: 0x777777,
        useDepthTexture: true,
    });
    groundReflector.position.y = planePosY;
    groundReflector.rotation.x = planeRotX;
    groundReflector.material.depthWrite = false;
    scene.add(groundReflector);

    let ssrPass = new THREE.SSRPass({
        renderer,
        scene,
        camera,
        // width: window.innerWidth,
        // height: window.innerHeight,
        width: innerWidth,
        height: innerHeight,
        // encoding: THREE.sRGBEncoding,
        groundReflector: groundReflector,
        // selects: params.groundReflector ? selects : null
        selects: selects
    });
    ssrPass.maxDistance = 12.5;
    ssrPass.opacity = .3;
    groundReflector.maxDistance = ssrPass.maxDistance;
    groundReflector.opacity = ssrPass.opacity;

    composer.addPass(ssrPass);

    console.log(effect)
    console.log(composer)
    console.log('ssrpas', ssrPass)
    console.log('helper', helper)

    //

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    effect.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    if (ready) {
        // helper.audio.pause();
        helper.update(clock.getDelta());
    }
    composer.render();
    // composer.renderer.autoClear = false;
    // effect.render(scene, camera);
    // composer.renderer.autoClear = true;
    if (effect) {
    } else if (composer) {
    }
}
