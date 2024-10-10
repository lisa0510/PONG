attribute vec2 aVertex;
attribute vec3 aColor;
varying vec3 vColor;
uniform mat3 uProjectionMat;
uniform mat3 uModelMat;

void main() {
    vec3 pos = uProjectionMat * uModelMat * vec3(aVertex, 1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);
    vColor = aColor;
}
