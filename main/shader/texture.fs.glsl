/**
 * a phong shader implementation with texture support
 */
precision mediump float;

#define MAX_LIGHTS_COUNT 10

/**
 * definition of a material structure containing common properties
 */
struct Material {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
	vec4 emission;
	float shininess;
};

/**
 * definition of the light properties related to material properties
 */
struct Light {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
	bool isSpotLight;
	float spotAngle;
	vec3 spotDirection;
	float spotSmoothExp;
};

//illumination related variables
uniform Light u_lights[MAX_LIGHTS_COUNT];
uniform vec3 u_lightsPos[MAX_LIGHTS_COUNT];
uniform Material u_material;
uniform int u_lightsCount;
varying vec3 v_normalVec;
varying vec3 v_eyeVec;

//texture related variables
uniform bool u_enableObjectTexture;
//TASK 1: define texture sampler and texture coordinates
varying vec2 v_texCoord;
uniform sampler2D u_tex;
//EXTRA TASK: define uniform for time variable
uniform float u_wobbleTime;

vec4 calculateSimplePointLight(Light light, Material material, vec3 lightVec, vec3 normalVec, vec3 eyeVec, vec4 textureColor) {
	lightVec = normalize(lightVec);
	normalVec = normalize(normalVec);
	eyeVec = normalize(eyeVec);

	//compute diffuse term
	float diffuse = max(dot(normalVec,lightVec),0.0);

	//compute specular term
	vec3 reflectVec = reflect(-lightVec,normalVec);
	float spec = pow( max( dot(reflectVec, eyeVec), 0.0) , material.shininess);

	float ambient = 1.0;
	if(light.isSpotLight){
		vec3 normSpotDirection = normalize(light.spotDirection);
		float diff = acos(dot(normSpotDirection, -lightVec)) - light.spotAngle;
		if(diff > 0.0){
			spec = 0.0;
			diffuse = 0.0;
			ambient = 0.0; //black around spotlight
		}else{
			diffuse = diffuse * pow(-diff/light.spotAngle,light.spotSmoothExp);
		}
	}

	if(u_enableObjectTexture)
  {
    //TASK 2: replace diffuse and ambient material color with texture color
    material.diffuse = textureColor;
    material.ambient = textureColor;
		//Note: an alternative to replacing the material color is to multiply it with the texture color
  }

	vec4 c_amb  = clamp(ambient * light.ambient * material.ambient, 0.0, 1.0);
	vec4 c_diff = clamp(diffuse * light.diffuse * material.diffuse, 0.0, 1.0);
	vec4 c_spec = clamp(spec * light.specular * material.specular, 0.0, 1.0);
	vec4 c_em   = material.emission;
	vec4 c = c_amb + c_diff + c_spec + c_em;

	if(u_enableObjectTexture)
  {
		c[3] = textureColor[3];
	}
  return c;
}

void main (void) {

  vec4 textureColor = vec4(0,0,0,1);
  if(u_enableObjectTexture){
    textureColor = texture2D(u_tex,v_texCoord);
  }
	vec4 fragColor = vec4(0);

	for(int i = 0; i < MAX_LIGHTS_COUNT; i++){
			if(i < u_lightsCount){
				fragColor += calculateSimplePointLight(u_lights[i], u_material, u_lightsPos[i] + v_eyeVec, v_normalVec, v_eyeVec, textureColor);
			}
	}
	gl_FragColor = fragColor;
}
