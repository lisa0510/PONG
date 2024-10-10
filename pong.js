"use strict"

window.onload = function() {
    let canvas = document.getElementById("myCanvas");
    let gl = canvas.getContext("webgl");

    MakeShader(gl, "./vertex-shader.glsl", "./fragment-shader.glsl")
        .then(sp => main(gl, sp));
}
