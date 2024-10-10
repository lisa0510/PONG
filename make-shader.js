"use strict"

async function MakeShader(gl, vsfile, fsfile) {
    const vsprog = await fetch(vsfile)
        .then(result => result.text());
    let vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsprog);
    gl.compileShader(vs);

    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        console.error("Vertex shader compilation failed:", gl.getShaderInfoLog(vs));
        gl.deleteShader(vs);
        return null;
    }

    const fsprog = await fetch(fsfile)
        .then(result => result.text());
    let fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsprog);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        console.error("Fragment shader compilation failed:", gl.getShaderInfoLog(fs));
        gl.deleteShader(fs);
        return null;
    }

    let sp = gl.createProgram();
    gl.attachShader(sp, vs);
    gl.attachShader(sp, fs);
    gl.linkProgram(sp);

    if (!gl.getProgramParameter(sp, gl.LINK_STATUS)) {
        console.error("Shader program linking failed:", gl.getProgramInfoLog(sp));
        gl.deleteProgram(sp);
        return null;
    }

    gl.useProgram(sp);
    return sp;
}
