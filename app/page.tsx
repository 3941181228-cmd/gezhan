"use client";

import { useEffect, useRef, useState } from "react";
import ParticleTitle from "./particle-title";

const navigation = [
  { label: "HOME", href: "/" },
  { label: "ABOUT ME", href: "/about" },
  { label: "PORTFOLIO", href: "/portfolio" },
  { label: "CONTACT", href: "/contact" },
];

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    let width = 0;
    let height = 0;
    let frame = 0;
    let animation = 0;
    let targetX = 0;
    let targetY = 0;
    let shiftX = 0;
    let shiftY = 0;
    let stars: Array<{ x: number; y: number; r: number; a: number; p: number; d: number }> = [];

    const random = (index: number) => {
      const value = Math.sin(index * 9341.117 + 53.41) * 48127.228;
      return value - Math.floor(value);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(900, Math.round((width * height) / 2600));
      stars = Array.from({ length: count }, (_, index) => ({
        x: random(index * 6 + 1) * width,
        y: random(index * 6 + 2) * height,
        r: 0.25 + random(index * 6 + 3) * 1.05,
        a: 0.08 + random(index * 6 + 4) * 0.62,
        p: random(index * 6 + 5) * Math.PI * 2,
        d: 0.25 + random(index * 6 + 6) * 0.75,
      }));
    };

    const pointer = (event: PointerEvent) => {
      targetX = (event.clientX / Math.max(1, width) - 0.5) * 9;
      targetY = (event.clientY / Math.max(1, height) - 0.5) * 9;
    };

    const draw = () => {
      frame += 0.01;
      shiftX += (targetX - shiftX) * 0.018;
      shiftY += (targetY - shiftY) * 0.018;
      context.clearRect(0, 0, width, height);
      for (const star of stars) {
        const alpha = star.a * (0.76 + Math.sin(frame + star.p) * 0.24);
        context.beginPath();
        context.fillStyle = `rgba(236,244,251,${alpha})`;
        context.arc(star.x + shiftX * star.d, star.y + shiftY * star.d, star.r, 0, Math.PI * 2);
        context.fill();
      }
      animation = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", pointer, { passive: true });
    animation = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", pointer);
    };
  }, []);

  return <canvas ref={canvasRef} className="star-field home-star-field" aria-hidden="true" />;
}

function GridLines() {
  return (
    <div className="grid-lines home-grid-lines" aria-hidden="true">
      {[0, 1, 2, 3].map((line) => <div className="grid-line" key={line}><i className="grid-marker" /></div>)}
    </div>
  );
}

function BrandGlyph() {
  return <span className="brand-glyph" aria-label="Levin Design"><i className="glyph-slash" /><i className="glyph-dot" /></span>;
}

function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: false });
    if (!gl) {
      const context = canvas.getContext("2d");
      if (!context) return;
      const renderSize = 480;
      const surface = document.createElement("canvas");
      surface.width = renderSize;
      surface.height = renderSize;
      const surfaceContext = surface.getContext("2d");
      if (!surfaceContext) return;
      const surfaceImage = surfaceContext.createImageData(renderSize, renderSize);
      const textureWidth = 720;
      const textureHeight = 360;
      const landTexture = new Uint8Array(textureWidth * textureHeight);
      const terrainTexture = new Uint8Array(textureWidth * textureHeight);
      const cityTexture = new Uint8Array(textureWidth * textureHeight);

      const hash = (x: number, y: number) => {
        const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
        return value - Math.floor(value);
      };
      const smoothNoise = (x: number, y: number) => {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        const fx = x - ix;
        const fy = y - iy;
        const ux = fx * fx * (3 - 2 * fx);
        const uy = fy * fy * (3 - 2 * fy);
        const a = hash(ix, iy);
        const b = hash(ix + 1, iy);
        const c = hash(ix, iy + 1);
        const d = hash(ix + 1, iy + 1);
        return (a + (b - a) * ux) * (1 - uy) + (c + (d - c) * ux) * uy;
      };
      const fbm = (x: number, y: number) => {
        let value = 0;
        let amplitude = 0.5;
        for (let octave = 0; octave < 5; octave++) {
          value += smoothNoise(x, y) * amplitude;
          x = x * 2.03 + 7.13;
          y = y * 2.03 + 3.71;
          amplitude *= 0.5;
        }
        return value;
      };
      const ellipse = (u: number, v: number, cx: number, cy: number, rx: number, ry: number, angle: number) => {
        let dx = u - cx;
        if (dx > 0.5) dx -= 1;
        if (dx < -0.5) dx += 1;
        const dy = v - cy;
        const sine = Math.sin(angle);
        const cosine = Math.cos(angle);
        const px = dx * cosine - dy * sine;
        const py = dx * sine + dy * cosine;
        return 1 - Math.hypot(px / rx, py / ry);
      };

      for (let y = 0; y < textureHeight; y++) {
        const v = y / (textureHeight - 1);
        for (let x = 0; x < textureWidth; x++) {
          const u = x / (textureWidth - 1);
          let field = -2;
          field = Math.max(field, ellipse(u,v,.70,.66,.135,.105,-.18));
          field = Math.max(field, ellipse(u,v,.61,.70,.080,.060,-.30));
          field = Math.max(field, ellipse(u,v,.72,.55,.042,.095,.48));
          field = Math.max(field, ellipse(u,v,.755,.37,.072,.175,-.22));
          field = Math.max(field, ellipse(u,v,.02,.66,.115,.065,.10));
          field = Math.max(field, ellipse(u,v,.045,.43,.090,.180,.05));
          field = Math.max(field, ellipse(u,v,.18,.67,.180,.105,-.05));
          field = Math.max(field, ellipse(u,v,.30,.31,.075,.055,-.15));
          const coast = (fbm(u * 32 + 4, v * 18 + 2) - .5) * .34;
          const index = y * textureWidth + x;
          const land = field + coast > -.02;
          const terrain = fbm(u * 68 + 12, v * 36 + 8);
          landTexture[index] = land ? 255 : 0;
          terrainTexture[index] = Math.max(0, Math.min(255, Math.round(terrain * 255)));
          const populated = v > .25 && v < .86;
          const eastAmerica = ellipse(u,v,.735,.65,.055,.10,-.1) > -.28;
          const europeAsia = ellipse(u,v,.12,.66,.18,.09,0) > -.24;
          const density = (eastAmerica || europeAsia ? .968 : .987);
          cityTexture[index] = land && populated && hash(x * 3 + 19, y * 3 + 7) > density ? 255 : 0;
        }
      }

      let width = 0;
      let height = 0;
      let dpr = 1;
      let animation = 0;
      let lastPaint = 0;
      let targetX = 0;
      let targetY = 0;
      let pointerX = 0;
      let pointerY = 0;
      const start = performance.now();
      const resize = () => {
        dpr = Math.min(window.devicePixelRatio || 1, 1.6);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      const pointer = (event: PointerEvent) => {
        targetX = event.clientX / Math.max(1, width) * 2 - 1;
        targetY = 1 - event.clientY / Math.max(1, height) * 2;
      };
      const paintSurface = (angle: number) => {
        const data = surfaceImage.data;
        const radius = renderSize * .485;
        const center = renderSize / 2;
        const cosine = Math.cos(-angle);
        const sine = Math.sin(-angle);
        for (let py = 0; py < renderSize; py++) {
          const ny = -(py - center) / radius;
          for (let px = 0; px < renderSize; px++) {
            const nx = (px - center) / radius;
            const radiusSquared = nx * nx + ny * ny;
            const offset = (py * renderSize + px) * 4;
            if (radiusSquared > 1) {
              data[offset + 3] = 0;
              continue;
            }
            const nz = Math.sqrt(1 - radiusSquared);
            const modelX = nx * cosine - nz * sine;
            const modelZ = nx * sine + nz * cosine;
            let u = Math.atan2(modelZ, modelX) / (Math.PI * 2) + .5;
            if (u < 0) u += 1;
            if (u > 1) u -= 1;
            const v = ny * .5 + .5;
            const tx = Math.max(0, Math.min(textureWidth - 1, Math.floor(u * (textureWidth - 1))));
            const ty = Math.max(0, Math.min(textureHeight - 1, Math.floor(v * (textureHeight - 1))));
            const textureIndex = ty * textureWidth + tx;
            const land = landTexture[textureIndex] / 255;
            const terrain = terrainTexture[textureIndex] / 255;
            const diffuse = Math.max(0, nx * -.93 + ny * .08 + nz * .19);
            const facing = nz;
            const night = 1 - Math.max(0, Math.min(1, (diffuse - .02) / .40));
            const ocean = [1.5, 2.8, 4.4];
            const landBase = 7 + terrain * 18;
            const light = .09 + diffuse * 1.10;
            let red = (ocean[0] * (1 - land) + landBase * land) * light;
            let green = (ocean[1] * (1 - land) + (landBase + 3) * land) * light;
            let blue = (ocean[2] * (1 - land) + (landBase + 4) * land) * light;
            if (cityTexture[textureIndex] && night > .24) {
              red += 155 * night;
              green += 195 * night;
              blue += 238 * night;
            }
            const rim = Math.pow(1 - facing, 2.45) * (.10 + diffuse * .95);
            red += 138 * rim;
            green += 171 * rim;
            blue += 202 * rim;
            const sharpRim = Math.pow(1 - facing, 8) * Math.max(0, Math.min(1, diffuse / .45));
            red += 150 * sharpRim;
            green += 175 * sharpRim;
            blue += 196 * sharpRim;
            data[offset] = Math.min(255, red);
            data[offset + 1] = Math.min(255, green);
            data[offset + 2] = Math.min(255, blue);
            data[offset + 3] = 255;
          }
        }
        surfaceContext.putImageData(surfaceImage, 0, 0);
      };
      const renderFallback = (now: number) => {
        pointerX += (targetX - pointerX) * .025;
        pointerY += (targetY - pointerY) * .025;
        if (now - lastPaint > 66) {
          lastPaint = now;
          const angle = (now - start) * .000055 + pointerX * .16;
          paintSurface(angle);
          context.clearRect(0, 0, width, height);
          const mobile = width / Math.max(1, height) < 1.1;
          const diameter = height * (mobile ? .44 : .58);
          const centerX = width * (mobile ? .5 : .32) + pointerX * width * .008;
          const centerY = height * (mobile ? .36 : .5225) - pointerY * height * .006;
          context.drawImage(surface, centerX - diameter / 2, centerY - diameter / 2, diameter, diameter);
        }
        animation = requestAnimationFrame(renderFallback);
      };

      resize();
      window.addEventListener("resize", resize);
      window.addEventListener("pointermove", pointer, { passive: true });
      animation = requestAnimationFrame(renderFallback);
      return () => {
        cancelAnimationFrame(animation);
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", pointer);
      };
    }

    const vertexShaderSource = `
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      uniform float uTime;
      uniform float uAspect;
      uniform vec2 uPointer;
      varying vec3 vNormal;
      varying vec3 vModel;

      mat3 rotateY(float angle) {
        float s = sin(angle); float c = cos(angle);
        return mat3(c,0.0,-s, 0.0,1.0,0.0, s,0.0,c);
      }
      mat3 rotateX(float angle) {
        float s = sin(angle); float c = cos(angle);
        return mat3(1.0,0.0,0.0, 0.0,c,s, 0.0,-s,c);
      }
      void main() {
        float yaw = uTime * 0.055 + uPointer.x * 0.16;
        float pitch = -0.16 + uPointer.y * 0.08;
        mat3 rotation = rotateX(pitch) * rotateY(yaw);
        vec3 position = rotation * aPosition;
        vNormal = normalize(rotation * aNormal);
        vModel = aPosition;
        float mobile = step(uAspect, 1.1);
        float scale = mix(0.58, 0.44, mobile);
        vec2 center = mix(vec2(-0.36, -0.045), vec2(0.0, 0.28), mobile);
        vec2 clip = vec2(position.x * scale / uAspect, position.y * scale) + center;
        clip += uPointer * vec2(0.016, 0.011);
        gl_Position = vec4(clip, -position.z * 0.12, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      varying vec3 vNormal;
      varying vec3 vModel;

      float hash31(vec3 p) {
        p = fract(p * 0.1031);
        p += dot(p, p.yzx + 33.33);
        return fract((p.x + p.y) * p.z);
      }
      float noise3(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(mix(hash31(i + vec3(0.0,0.0,0.0)), hash31(i + vec3(1.0,0.0,0.0)), f.x),
              mix(hash31(i + vec3(0.0,1.0,0.0)), hash31(i + vec3(1.0,1.0,0.0)), f.x), f.y),
          mix(mix(hash31(i + vec3(0.0,0.0,1.0)), hash31(i + vec3(1.0,0.0,1.0)), f.x),
              mix(hash31(i + vec3(0.0,1.0,1.0)), hash31(i + vec3(1.0,1.0,1.0)), f.x), f.y), f.z);
      }
      float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 6; i++) {
        value += amplitude * noise3(p);
        p = p * 2.03 + vec3(1.7, 3.1, 2.4);
        amplitude *= 0.5;
      }
        return value;
      }
      float ellipseField(vec2 uv, vec2 center, vec2 radius, float angle) {
        vec2 p = uv - center;
        float s = sin(angle); float c = cos(angle);
        p = mat2(c,-s,s,c) * p;
        return 1.0 - length(p / radius);
      }
      void main() {
        vec3 model = normalize(vModel);
        vec3 normal = normalize(vNormal);
        float longitude = atan(model.z, model.x) / 6.2831853 + 0.5;
        float latitude = model.y * 0.5 + 0.5;
        vec2 uv = vec2(longitude, latitude);

        float landField = -2.0;
        landField = max(landField, ellipseField(uv, vec2(0.70,0.66), vec2(0.135,0.105), -0.18));
        landField = max(landField, ellipseField(uv, vec2(0.61,0.70), vec2(0.080,0.060), -0.30));
        landField = max(landField, ellipseField(uv, vec2(0.72,0.55), vec2(0.042,0.095), 0.48));
        landField = max(landField, ellipseField(uv, vec2(0.755,0.37), vec2(0.072,0.175), -0.22));
        landField = max(landField, ellipseField(uv, vec2(0.02,0.66), vec2(0.115,0.065), 0.10));
        landField = max(landField, ellipseField(uv, vec2(0.045,0.43), vec2(0.090,0.180), 0.05));
        landField = max(landField, ellipseField(uv, vec2(0.18,0.67), vec2(0.180,0.105), -0.05));
        landField = max(landField, ellipseField(uv, vec2(0.30,0.31), vec2(0.075,0.055), -0.15));
        float coastNoise = (fbm(model * 9.0 + vec3(4.0,1.0,7.0)) - 0.5) * 0.34;
        float land = smoothstep(-0.09, 0.035, landField + coastNoise);

        vec3 lightDirection = normalize(vec3(-0.93, 0.08, 0.19));
        vec3 viewDirection = vec3(0.0, 0.0, 1.0);
        float diffuse = max(dot(normal, lightDirection), 0.0);
        float facing = max(dot(normal, viewDirection), 0.0);
        float night = 1.0 - smoothstep(0.02, 0.42, diffuse);
        float terrain = fbm(model * 17.0 + vec3(2.0,8.0,1.0));
        vec3 oceanColor = vec3(0.006, 0.011, 0.017);
        vec3 landColor = mix(vec3(0.030,0.038,0.044), vec3(0.105,0.118,0.125), terrain);
        vec3 color = mix(oceanColor, landColor, land) * (0.09 + diffuse * 1.10);

        // 海洋高光:太阳在水面反射的亮斑,增强水的质感
        vec3 reflectDir = reflect(-lightDirection, normal);
        float specular = pow(max(dot(reflectDir, viewDirection), 0.0), 28.0) * (1.0 - land);
        color += vec3(0.35, 0.42, 0.55) * specular * 0.8;

        float citySeed = noise3(model * 92.0) * 0.72 + noise3(model * 183.0 + vec3(7.0)) * 0.28;
        float cities = smoothstep(0.76, 0.91, citySeed) * land * night;
        float populatedBand = smoothstep(0.10, 0.28, latitude) * (1.0 - smoothstep(0.79, 0.93, latitude));
        cities *= populatedBand;
        color += cities * vec3(0.72, 0.85, 1.0) * 1.35;

        // 双层云:低频厚云 + 高频薄云细节
        float cloudLow = smoothstep(0.63, 0.76, fbm(model * 11.0 + vec3(11.0,3.0,4.0)));
        float cloudHigh = smoothstep(0.72, 0.86, fbm(model * 22.0 + vec3(5.0,9.0,2.0))) * 0.4;
        float cloud = cloudLow + cloudHigh;
        color += cloud * vec3(0.14,0.16,0.18) * (0.12 + diffuse * 0.46);

        // 大气辉光:rim 更蓝更亮 + 外层柔光晕
        float rim = pow(1.0 - facing, 2.45);
        color += vec3(0.42,0.58,0.88) * rim * (0.14 + diffuse * 1.05);
        float sharpRim = pow(1.0 - facing, 8.0) * smoothstep(0.0,0.45,diffuse);
        color += vec3(0.82,0.91,1.0) * sharpRim * 0.72;
        float halo = pow(1.0 - facing, 4.0);
        color += vec3(0.18,0.26,0.45) * halo * (0.08 + diffuse * 0.4);
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Globe shader compile failed:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compile(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compile(gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Globe shader link failed:", gl.getProgramInfoLog(program));
      return;
    }

    const latitudeBands = 128;
    const longitudeBands = 192;
    const vertices: number[] = [];
    const indices: number[] = [];
    for (let latitude = 0; latitude <= latitudeBands; latitude++) {
      const theta = latitude * Math.PI / latitudeBands;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      for (let longitude = 0; longitude <= longitudeBands; longitude++) {
        const phi = longitude * Math.PI * 2 / longitudeBands;
        const x = Math.cos(phi) * sinTheta;
        const y = cosTheta;
        const z = Math.sin(phi) * sinTheta;
        vertices.push(x, y, z, x, y, z);
      }
    }
    for (let latitude = 0; latitude < latitudeBands; latitude++) {
      for (let longitude = 0; longitude < longitudeBands; longitude++) {
        const first = latitude * (longitudeBands + 1) + longitude;
        const second = first + longitudeBands + 1;
        indices.push(first, second, first + 1, second, second + 1, first + 1);
      }
    }

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    const positionLocation = gl.getAttribLocation(program, "aPosition");
    const normalLocation = gl.getAttribLocation(program, "aNormal");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(normalLocation);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 24, 12);
    const timeLocation = gl.getUniformLocation(program, "uTime");
    const aspectLocation = gl.getUniformLocation(program, "uAspect");
    const pointerLocation = gl.getUniformLocation(program, "uPointer");

    let width = 0;
    let height = 0;
    let animation = 0;
    let targetX = 0;
    let targetY = 0;
    let pointerX = 0;
    let pointerY = 0;
    const start = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const pointer = (event: PointerEvent) => {
      targetX = event.clientX / Math.max(1, width) * 2 - 1;
      targetY = 1 - event.clientY / Math.max(1, height) * 2;
    };
    const render = (now: number) => {
      pointerX += (targetX - pointerX) * 0.025;
      pointerY += (targetY - pointerY) * 0.025;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.useProgram(program);
      gl.uniform1f(timeLocation, (now - start) / 1000);
      gl.uniform1f(aspectLocation, width / Math.max(1, height));
      gl.uniform2f(pointerLocation, pointerX, pointerY);
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
      animation = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", pointer, { passive: true });
    animation = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", pointer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return <canvas ref={canvasRef} className="globe-canvas" aria-label="缓慢旋转的三维地球" />;
}

function Constellation() {
  return (
    <div className="home-constellation" aria-label="Personal orbit">
      <p><i />PERSONAL ORBIT</p>
      <svg viewBox="0 0 180 122" role="img" aria-label="可交互的星座图">
        <path d="M22 76 L66 55 L103 70 L147 36" />
        <path d="M66 55 L88 105 L137 119" />
        <path d="M103 70 L125 98" />
        {[[22,76],[66,55],[103,70],[147,36],[88,105],[137,119]].map(([cx,cy], index) => (
          <circle cx={cx} cy={cy} r={index === 1 ? 3.2 : 2.25} key={`${cx}-${cy}`} />
        ))}
      </svg>
    </div>
  );
}

export default function Home() {
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 100);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", menuOpen);
    return () => document.documentElement.classList.remove("menu-open");
  }, [menuOpen]);

  return (
    <div className={`app-shell home-shell${ready ? " is-ready" : ""}${menuOpen ? " menu-open" : ""}`}>
      <StarField />
      <div className="home-backlight" aria-hidden="true" />
      <div className="home-globe-halo" aria-hidden="true" />
      <Globe />
      <div className="home-orbit-rings" aria-hidden="true"><i /><i /><i /></div>
      <GridLines />

      <div className="site-chrome home-chrome">
        <button className="menu-trigger" type="button" aria-label={menuOpen ? "关闭菜单" : "打开菜单"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          <span className="menu-icon" aria-hidden="true"><i /><i /><i /></span><span>MENU</span>
        </button>
        <p className="site-motto">REACH<br />PERFECTION</p>
        <div className="bottom-mark"><BrandGlyph /></div>
        <div className="site-legal" aria-label="版权信息"><span>©</span><span>2026 LEVIN DESIGN</span><i>•</i><a href="#privacy">PRIVACY POLICY</a></div>
        <p className="home-welcome">WELCOME!</p>
      </div>

      <div className={`menu-overlay${menuOpen ? " is-open" : ""}`} aria-hidden={!menuOpen}>
        <div className="menu-art" aria-hidden="true"><i className="menu-art-top" /><i className="menu-art-middle" /><i className="menu-art-dot" /></div>
        <nav className="menu-nav" aria-label="主导航">
          {navigation.map((item, index) => (
            <a href={item.href} className={index === 0 ? "is-active" : ""} tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)} key={item.label}><span>{item.label}</span><i /></a>
          ))}
        </nav>
      </div>

      <main className="home-stage">
        <section className="home-copy" aria-labelledby="home-title">
          <h1 id="home-title" className="sr-only">Levin Design — UI and HMI designer</h1>
          <div className="home-title-art" id="home-title-art" aria-hidden="true">
            <span className="home-title-ghost">LEVIN.DESIGN</span><span className="home-title-ghost">/ PORTFOLIO</span>
            <ParticleTitle lines={["LEVIN.DESIGN", "/ PORTFOLIO"]} />
          </div>
        </section>
        <Constellation />
        <a className="explore-work" href="/portfolio/"><i /><span>EXPLORE MY WORK!</span><i /></a>
      </main>
    </div>
  );
}
