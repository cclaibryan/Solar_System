(function ()
{
    var global = this;
    var THREE = global.THREE,
        requestAnimationFrame = global.requestAnimationFrame;

    var renderer, scene, camera, controls, light, material;
    var mouse = new THREE.Vector2();
    var clock = new THREE.Clock();
    var bindInputs = function ()
    {
        key(',', function ()
        {
            simulationSpeed *= 0.9;
        });
        key('.', function ()
        {
            simulationSpeed *= 1.1;
        });
        key(';', function ()
        {
            orbitMagnify *= 0.995;
        });
        key("'", function ()
        {
            orbitMagnify *= 1.005;
        });
    };

    //universe
    var simulationSpeed = 30;
    var orbitMagnify = 1;
    var milkyWaySize = 15000;
    var sunSize = 20;
    var planets = [];
    var planetsMesh = [];
    var ringMesh = [];

    planets[0] =
    {
        name: "mercury",
        radius: 1.2,
        ringSize: 0,
        tex: 'mercury.jpg',
        a: 0.38709930,
        e: 0.2056376,
        i: 0.122250601,
        L: 48.3194793,
        w: 29.1527676,
        T: 87.97,
        t: 58.65,
        theta: 0,
        alpha: 28,
        orientation: new THREE.Vector3(0, 1, 0)
    };

    planets[1] =
    {
        name: "venus",
        radius: 6,
        ringSize: 0,
        tex: 'venus.jpg',
        a: 0.72333601,
        e: 0.0067730,
        i: 0.0592470341,
        L: 76.6548368,
        w: 54.9478720,
        T: 224.7,
        t: -243.01,
        theta: 0,
        alpha: 177,
        orientation: new THREE.Vector3(0, 1, 0)
    };

    planets[2] =
    {
        name: "earth",
        radius: 6.3,
        ringSize: 0,
        tex: 'earth.jpg',
        a: 1.00000312,
        e: 0.0167072,
        i: -0.0000206140838,
        L: 0.0000000,
        w: 102.9667920,
        T: 365.24,
        t: 0.9973,
        theta: 0,
        alpha: 23.45,
        orientation: new THREE.Vector3(0, 1, 0)
    };

    planets[3] =
    {
        name: "mars",
        radius: 3.3,
        ringSize: 0,
        tex: 'mars.jpg',
        a: 1.52371200,
        e: 0.0934012,
        i: 0.0322704258,
        L: 49.5331933,
        w: 286.5631954,
        T: 686.93,
        t: 1.0260,
        theta: 0,
        alpha: 23.98,
        orientation: new THREE.Vector3(0, 1, 0)
    };

    planets[4] =
    {
        name: "jupiter",
        radius: 10,
        ringSize: 27,
        tex: 'jupiter.jpg',
        a: 5.20287655,
        e: 0.0483743,
        i: 0.0227631339,
        L: 100.4923411,
        w: 274.2552763,
        T: 11.8565 * 365,
        t: 0.410,
        theta: 0,
        alpha: 3.08,
        orientation: new THREE.Vector3(0, 1, 0)
    };

    planets[5] =
    {
        name: "saturn",
        radius: 9,
        ringSize: 27,
        tex: 'saturn.jpg',
        a: 9.53656333,
        e: 0.0538159,
        i: 0.0433917859,
        L: 113.6364296,
        w: 338.9247211,
        T: 29.448 * 365,
        t: 0.426,
        theta: 0,
        alpha: 26.73,
        orientation: new THREE.Vector3(0, 1, 0)
    };

    planets[6] =
    {
        name: "uranus",
        radius: 7,
        ringSize: 21,
        tex: 'uranus.jpg',
        a: 19.1889880,
        e: 0.0472535,
        i: 0.0134812565,
        L: 74.0207436,
        w: 96.9702770,
        T: 84.02 * 365,
        t: 0.646,
        theta: 0,
        alpha: 97.92,
        orientation: new THREE.Vector3(0, 1, 0)
    };

    planets[7] =
    {
        name: "neptune",
        radius: 7,
        ringSize: 0,
        tex: 'neptune.jpg',
        a: 30.0699464,
        e: 0.0085951,
        i: 0.030893642,
        L: 131.7837677,
        w: 273.1519618,
        T: 164.79 * 365,
        t: 0.658,
        theta: 0,
        alpha: 28.8,
        orientation: new THREE.Vector3(0, 1, 0)
    };
    
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;

    bindInputs();
    init();
    animate();

    function init()
    {
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.00008);

        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000);
        camera.position.z = 50;
        camera.position.y = 0;

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(WIDTH, HEIGHT);
        document.body.appendChild(renderer.domElement);

        controls = new THREE.FlyControls(camera);
        controls.dragToLook = false;

        //ambient light
        scene.add(new THREE.AmbientLight(0x222222));

        //sunlight
        light = new THREE.PointLight(0xffffff, 1.5, 0);
        light.position.set(0, 0, 0);
        scene.add(light);
        
        //the Milky Way
        material = new THREE.MeshBasicMaterial
        ({
            map: THREE.ImageUtils.loadTexture('textures/milky-way.jpg'),
            side: THREE.DoubleSide
        });
        milkyWay = new THREE.Mesh(new THREE.SphereGeometry(milkyWaySize, 100, 100), material);
        scene.add(milkyWay);
        
        //the sun
        material = new THREE.MeshBasicMaterial
        ({
            map: THREE.ImageUtils.loadTexture('textures/sun.jpg'),
            side: THREE.DoubleSide
        });
        theSun = new THREE.Mesh(new THREE.SphereGeometry(sunSize, 100, 100), material);
        scene.add(theSun);


        //add all the planets
        for(var index = 0; index < 8; index++)
        {
            //create planets
            material = new THREE.MeshLambertMaterial
            ({
                map: THREE.ImageUtils.loadTexture('textures/' + planets[index].name + '.jpg'),
                shading: THREE.SmoothShading
            });
            planetsMesh[index] = new THREE.Mesh( new THREE.SphereGeometry(planets[index].radius, 50, 50), material);

            //create rings for saturn and uranus
            if(index == 5 || index == 6)
            {
                material = new THREE.MeshLambertMaterial
                ({
                    map: THREE.ImageUtils.loadTexture('textures/' + planets[index].name + '-ring.jpg'),
                    shading: THREE.SmoothShading,
                    side: THREE.DoubleSide
                });
                ringMesh[index] = new THREE.Mesh(new THREE.RingGeometry(planets[index].radius, planets[index].ringSize, 30), material);
                ringMesh[index].rotation.x = 90 * Math.PI / 180;
                planetsMesh[index].add(ringMesh[index]);
            }

            //set position
            var a = planets[index].a;
            var e = planets[index].e;
            var i = planets[index].i;
            var L = planets[index].L;
            var w = planets[index].w;
            var T = planets[index].T;
            var t = planets[index].t;
            var P = 365.256898326 * Math.pow(a, 1.5);           //Find the period, P, of the orbit in days.
            var m = getRandomArbitrary(0, 2 * Math.PI);     //Find the mean anomaly, m, of the orbit at time 'simulationTime'.

            //Find the eccentric anomaly, u. (Danby's method is used here.)
            var U1 = m;
            var U0, F0, F1, F2, F3, D1, D2, D3;
            do
            {
                U0 = U1;
                F0 = U0 - e * Math.sin(U0) - m;
                F1 = 1 - e * Math.cos(U0);
                F2 = e * Math.sin(U0);
                F3 = e * Math.cos(U0);
                D1 = -F0 / F1;
                D2 = -F0 / ( F1 + D1 * F2 / 2 );
                D3 = -F0 / ( F1 + D1 * F2 / 2 + Math.pow(D2, 2) * F3 / 6 );
                U1 = U0 + D3
            }
            while(Math.abs(U1-U0) < (0.000000000000001));
            var u = U1;
            //Find the canonical (triple prime) heliocentric position vector.
            var x3 = a * (Math.cos(u) - e);
            var y3 = a * Math.sin(u) * Math.sqrt(1 - Math.pow(e, 2));
            var z3 = 0;
            //Rotate the triple-prime position vector by the argument of the perihelion, w.
            var x2 = x3 * Math.cos(w) - y3 * Math.sin(w);
            var y2 = x3 * Math.sin(w) + y3 * Math.cos(w);
            var z2 = z3;
            //Rotate the double-prime position vector by the inclination, i.
            var x1 = x2;
            var y1 = y2 * Math.cos(i);
            var z1 = y2 * Math.sin(i);
            //Rotate the single-prime position vector by the longitude of the ascending node, L.
            var x0 = x1 * Math.cos(L) - y1 * Math.sin(L);
            var y0 = x1 * Math.sin(L) + y1 * Math.cos(L);
            var z0 = z1;

            var scaleDistances = 150;
            x0 *= scaleDistances;
            y0 *= scaleDistances;
            z0 *= scaleDistances;

            planetsMesh[index].position.x = y0;
            planetsMesh[index].position.y = z0;
            planetsMesh[index].position.z = x0;

            //set the orientation of the self-rotation axis
            var rotZ = planets[index].alpha * Math.PI / 180;
            var rotY = getRandomArbitrary(0, 360);
            var vector = new THREE.Vector3(0, 1, 0);
            var axis = new THREE.Vector3(0, 0, 1);
            var angle = rotZ;
            vector.applyAxisAngle(axis, angle);
            axis = new THREE.Vector3(0, 1, 0);
            angle = rotY;
            vector.applyAxisAngle(axis, angle);
            planetsMesh[index].rotation.z = rotZ;
            planetsMesh[index].rotation.y = rotY;
            planets[index].orientation = vector;

            scene.add(planetsMesh[index]);
        }

        window.addEventListener('resize', onWindowResize, false);

        renderer.domElement.addEventListener('mousemove', onMouseMove);
    }

    function onWindowResize()
    {
        camera.aspect = window.innerWidth / window.innerWidth;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerWidth );
    }

    function onMouseMove(e)
    {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }

    function animate()
    {
        requestAnimationFrame(animate);
        render();
    }

    
    function render()
    {
        var delta = clock.getDelta();

        //rotate sun
        theSun.rotation.y += 0.001 * simulationSpeed / 28;

        for(var index = 0; index < 8; index++)
        {
            //set position
            var a = planets[index].a;
            var e = planets[index].e;
            var i = planets[index].i;
            var L = planets[index].L;
            var w = planets[index].w;
            var T = planets[index].T;
            var t = planets[index].t;

            var P = 365.256898326 * Math.pow(a, 1.5);           //Find the period, P, of the orbit in days.
            planets[index].theta += simulationSpeed / T;
            var m = 2 * Math.PI * planets[index].theta / P;
            m = m % (2 * Math.PI);

            //Find the eccentric anomaly, u. (Danby's method is used here.)
            var U1 = m;
            var U0, F0, F1, F2, F3, D1, D2, D3;
            do{
                U0 = U1;
                F0 = U0 - e * Math.sin(U0) - m;
                F1 = 1 - e * Math.cos(U0);
                F2 = e * Math.sin(U0);
                F3 = e * Math.cos(U0);
                D1 = -F0 / F1;
                D2 = -F0 / ( F1 + D1 * F2 / 2 );
                D3 = -F0 / ( F1 + D1 * F2 / 2 + Math.pow(D2, 2) * F3 / 6 );
                U1 = U0 + D3
            }
            while(Math.abs(U1-U0) < (0.000000000000001));
            var u = U1;
            //Find the canonical (triple prime) heliocentric position vector.
            var x3 = a * (Math.cos(u) - e);
            var y3 = a * Math.sin(u) * Math.sqrt(1 - Math.pow(e, 2));
            var z3 = 0;
            //Rotate the triple-prime position vector by the argument of the perihelion, w.
            var x2 = x3 * Math.cos(w) - y3 * Math.sin(w);
            var y2 = x3 * Math.sin(w) + y3 * Math.cos(w);
            var z2 = z3;
            //Rotate the double-prime position vector by the inclination, i.
            var x1 = x2;
            var y1 = y2 * Math.cos(i);
            var z1 = y2 * Math.sin(i);
            //Rotate the single-prime position vector by the longitude of the ascending node, L.
            var x0 = x1 * Math.cos(L) - y1 * Math.sin(L);
            var y0 = x1 * Math.sin(L) + y1 * Math.cos(L);
            var z0 = z1;

            var scaleDistances = 150 * orbitMagnify;
            x0 *= scaleDistances;
            y0 *= scaleDistances;
            z0 *= scaleDistances;

            planetsMesh[index].position.x = y0;
            planetsMesh[index].position.y = z0;
            planetsMesh[index].position.z = x0;

            planetsMesh[index].rotateOnAxis(new THREE.Vector3(0, 1, 0), 0.001 * simulationSpeed / t);

        }
        controls.update(delta);
        renderer.render( scene, camera );
    }

    function getRandomArbitrary(min, max)
    {
        return Math.random() * (max - min) + min;
    }

}).call(this);