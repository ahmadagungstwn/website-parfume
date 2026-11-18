import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { interpolatePose } from "./motion.js";

export async function mountBottle() {
  const container = document.querySelector("#bottle-stage");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.setClearColor(0xeee5dc, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  container.append(renderer.domElement);
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const studio = new THREE.Scene();
  studio.background = new THREE.Color("#253024");
  const panelGeometry = new THREE.PlaneGeometry(1, 1);
  const panels = [
    { position: [-3, 1, 3], size: [1.2, 5], color: "#fff4dc", intensity: 9 },
    { position: [3, 0.5, 2], size: [0.45, 4.5], color: "#eef5ff", intensity: 12 },
    { position: [0, 4, 0], size: [4, 2], color: "#ffffff", intensity: 3 },
    { position: [0, 0, -4], size: [3, 4], color: "#d9e4b7", intensity: 1.5 },
  ];
  for (const panel of panels) {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(panel.color).multiplyScalar(panel.intensity),
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(panelGeometry, material);
    mesh.position.set(...panel.position);
    mesh.scale.set(...panel.size, 1);
    mesh.lookAt(0, 0, 0);
    studio.add(mesh);
  }
  const environment = pmrem.fromScene(studio, 0.01);
  scene.environment = environment.texture;
  scene.environmentIntensity = 1;
  studio.children.forEach(panel => panel.material.dispose());
  panelGeometry.dispose();
  pmrem.dispose();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 5000);
  camera.position.set(0, 0, 2000);
  const key = new THREE.DirectionalLight(0xfff3d6, 1.8);
  key.position.set(-300, 500, 700);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xe5f0df, 0.35);
  fill.position.set(500, 0, 300);
  scene.add(fill);
  const gltf = await new GLTFLoader().loadAsync("/assets/bottle.glb");
  const model = gltf.scene;
  const bounds = new THREE.Box3().setFromObject(model);
  const center = bounds.getCenter(new THREE.Vector3());
  const nativeHeight = bounds.max.y - bounds.min.y;
  model.position.sub(center);
  const bottle = new THREE.Group();
  bottle.add(model);
  scene.add(bottle);
  model.traverse((object) => {
    if (!object.isMesh) return;
    const material = object.material;
    if (material.name.startsWith("Crystal")) {
      material.color.set("#ffffff");
      material.roughness = 0.035;
      // shortcut: reflection-only glass composites over the DOM; true refraction needs the page in the render target.
      material.transmission = 0;
      material.thickness = 0.002;
      material.ior = 1.46;
      material.envMapIntensity = 1.5;
      material.metalness = 1;
      material.transparent = true;
      material.opacity = 1;
      material.depthWrite = false;
      object.renderOrder = 2;
      material.specularIntensity = 1;
      material.onBeforeCompile = shader => {
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <opaque_fragment>",
          `float glassFresnel = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 3.0);
           diffuseColor.a = 0.06 + 0.72 * glassFresnel;
           #include <opaque_fragment>`,
        );
      };
    }
    if (material.name.startsWith("Pale")) {
      // shortcut: opaque liquid avoids nested transmission artifacts; upgrade with a custom refraction pass if required.
      material.transmission = 0;
      material.color.set("#536b18");
      material.roughness = 0.075;
      material.metalness = 0;
      material.clearcoat = 1;
      material.clearcoatRoughness = 0.04;
    }
    if (material.name.startsWith("Forest")) {
      material.color.set("#092614");
      material.roughness = 0.2;
      material.clearcoat = 1;
      material.clearcoatRoughness = 0.08;
    }
    if (material.name.startsWith("Brushed")) {
      material.color.set("#c89a43");
      material.metalness = 1;
      material.roughness = 0.2;
      material.envMapIntensity = 1.5;
    }
  });
  let stops = [];
  let anchors = [];
  let width, height;
  const anchorIds = ["hero-bottle", "atelier-bottle", "featured-bottle"];
  function measure() {
    width = innerWidth;
    height = innerHeight;
    renderer.setSize(width, height);
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
    anchors = anchorIds.map((id) => {
      const rect = document.getElementById(id).getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        docY: rect.top + scrollY + rect.height / 2,
        height: rect.height,
      };
    });
    const mobile = width <= 650;
    const hero = anchors[0],
      atelier = anchors[1],
      feature = anchors[2];
    const atelierStop = atelier.docY - height * 0.55;
    const featureStop = feature.docY - height * 0.5;
    const collection = document.querySelector("#collection");
    const collectionTop = collection.offsetTop;
    const collectionEnd = collectionTop + collection.offsetHeight;
    const heroStop = mobile ? Math.max(0, hero.docY - height * 0.6) : 0;
    stops = [
      {
        scroll: 0,
        x: hero.x,
        y: hero.docY,
        height: hero.height,
        rx: 0.08,
        ry: -0.3,
        rz: -0.035,
      },
      ...(heroStop > 0
        ? [
            {
              scroll: heroStop,
              x: hero.x,
              y: hero.docY - heroStop,
              height: hero.height,
              rx: 0.08,
              ry: -0.3,
              rz: -0.035,
            },
          ]
        : []),
      {
        scroll: Math.max(heroStop + 100, collectionTop - height * 0.65),
        x: width * 1.05,
        y: height * 0.22,
        height: hero.height * 0.58,
        rx: 0.12,
        ry: 0.5,
        rz: -0.2,
      },
      {
        scroll: collectionTop + collection.offsetHeight * 0.38,
        x: width * 1.28,
        y: height * 0.25,
        height: hero.height * 0.45,
        rx: 0.12,
        ry: 0.7,
        rz: -0.3,
      },
      {
        scroll: collectionEnd - height * 0.45,
        x: width * 0.8,
        y: height * 1.3,
        height: atelier.height * 0.72,
        rx: 0.15,
        ry: -0.2,
        rz: -0.4,
      },
      {
        scroll: atelierStop - height * 0.25,
        x: atelier.x,
        y: height * 0.8,
        height: atelier.height,
        rx: 0.1,
        ry: -0.25,
        rz: -0.32,
      },
      {
        scroll: atelierStop,
        x: atelier.x,
        y: height * 0.55,
        height: atelier.height,
        rx: 0.1,
        ry: -0.25,
        rz: -0.32,
      },
      {
        scroll: atelierStop + height * 0.4,
        x: atelier.x,
        y: height * 0.15,
        height: atelier.height,
        rx: 0.1,
        ry: -0.25,
        rz: -0.32,
      },
      {
        scroll: atelierStop + height * 0.9,
        x: atelier.x - width * 0.06,
        y: -atelier.height * 0.65,
        height: atelier.height * 0.83,
        rx: 0.06,
        ry: 0.25,
        rz: -0.5,
      },
      {
        scroll: featureStop - height * 0.82,
        x: feature.x - width * 0.15,
        y: height * 1.25,
        height: feature.height * 0.9,
        rx: 0.1,
        ry: -0.45,
        rz: 0.13,
      },
      {
        scroll: featureStop,
        x: feature.x,
        y: height * 0.5,
        height: feature.height,
        rx: 0.08,
        ry: -0.28,
        rz: 0.025,
      },
      {
        scroll: featureStop + height * 0.9,
        x: feature.x,
        y: height * 0.5 - height * 0.9,
        height: feature.height,
        rx: 0.08,
        ry: -0.28,
        rz: 0.025,
      },
    ].sort((a, b) => a.scroll - b.scroll);
  }
  measure();
  let raf = 0,
    lastScroll = -1,
    current;
  const pointer = { x: 0, y: 0 };
  const render = () => {
    raf = 0;
    if (document.hidden || renderer.getContext().isContextLost()) return;
    let target;
    if (reduced.matches) {
      const anchor = anchors.reduce((a, b) =>
        Math.abs(a.docY - scrollY - height * 0.5) <
        Math.abs(b.docY - scrollY - height * 0.5)
          ? a
          : b,
      );
      target = {
        x: anchor.x,
        y: anchor.docY - scrollY,
        height: anchor.height,
        rx: 0.08,
        ry: -0.28,
        rz: 0,
      };
    } else {
      target = interpolatePose(scrollY, stops);
      target.ry += pointer.x * 0.12;
      target.rx += pointer.y * 0.06;
    }
    current ??= { ...target };
    let moving = false;
    for (const key of ["x", "y", "height", "rx", "ry", "rz"]) {
      const delta = target[key] - current[key];
      current[key] += reduced.matches ? delta : delta * 0.16;
      if (Math.abs(delta) > 0.001) moving = true;
    }
    bottle.position.set(current.x - width / 2, height / 2 - current.y, 0);
    bottle.scale.setScalar(current.height / nativeHeight);
    bottle.rotation.set(current.rx, current.ry, current.rz);
    bottle.visible =
      current.x > -current.height &&
      current.x < width + current.height &&
      current.y > -current.height &&
      current.y < height + current.height;
    renderer.render(scene, camera);
    document.documentElement.classList.add("has-3d");
    container.dataset.ready = "true";
    container.dataset.pose = `${Math.round(current.x)},${Math.round(current.y)},${Math.round(current.height)}`;
    if (moving || lastScroll !== scrollY) raf = requestAnimationFrame(render);
    lastScroll = scrollY;
  };
  const requestRender = () => {
    if (!raf) raf = requestAnimationFrame(render);
  };
  addEventListener("pointermove", event => {
    if (event.pointerType !== "mouse" || reduced.matches) return;
    pointer.x = event.clientX / width * 2 - 1;
    pointer.y = event.clientY / height * 2 - 1;
    requestRender();
  }, { passive: true });
  document.documentElement.addEventListener("pointerleave", () => {
    pointer.x = 0; pointer.y = 0;
    requestRender();
  });
  renderer.domElement.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    cancelAnimationFrame(raf);
    raf = 0;
    document.documentElement.classList.remove("has-3d");
  });
  renderer.domElement.addEventListener("webglcontextrestored", requestRender);
  addEventListener("scroll", requestRender, { passive: true });
  addEventListener("resize", () => {
    measure();
    current = null;
    requestRender();
  });
  document.addEventListener("visibilitychange", requestRender);
  reduced.addEventListener("change", () => {
    current = null;
    requestRender();
  });
  document.fonts.ready.then(() => {
    measure();
    requestRender();
  });
  requestRender();
}
