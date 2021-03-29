import { glsl } from '~/utils/glsl'

export const fragmentShader = glsl`
    uniform vec3 uColor;
    uniform sampler2D uTexture;
    uniform bool uIsFlag;

    varying float vRandom;
    varying vec2 vUv;
    varying float vElevation;

    void main() {
        vec4 textureColor = texture2D(uTexture, vUv);
        textureColor.rgb *= vElevation * 2. + .75;
        if (uIsFlag) {
            gl_FragColor = vec4(textureColor);
        }
        else {
            gl_FragColor = vec4(1., vRandom, 0.67, 1.0);
        }
    }
`
