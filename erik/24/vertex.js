import { glsl } from '~/utils/glsl'

export const vertexShader = glsl`
    uniform vec2 uFrequency;
    uniform float uTime;
    uniform bool uIsFlag;

    attribute float aRandom;

    varying float vRandom;
    varying vec2 vUv;
    varying float vElevation;

    void main(){
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);

        float elevation = sin(modelPosition.x * uFrequency.x - uTime * 5.) * 0.1;
        elevation += sin(modelPosition.y * uFrequency.y - uTime * 2.) * 0.1;
        
        float aRandomSin = aRandom;
        
        if (uIsFlag) {
            modelPosition.z += elevation;
        } else {
            modelPosition.z += aRandomSin * 0.1;
        }
        
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;

        gl_Position = projectedPosition;

        vRandom = aRandomSin;
        vUv = uv;
        vElevation = elevation;
    }
`
