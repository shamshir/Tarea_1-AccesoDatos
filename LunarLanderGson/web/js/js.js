// Documento XML
var jsonObject;

// Variables Globales
var modoDificil = false; // false o true
var pagina = "";
var menuVisible = true;
var aterrizadoPausado = true;
var fuelOut = false;
var gravedad = 4 * 1.622;
var dt = 0.016683;
var temporizador = null;
var temporizadorFuel = null;
var limiteVelocidad = 10;

// Variables Nave
var colorNave = "blanco"; // blanco o amarillo
var naveNormal = null;
var naveMotor = null;
var naveExplotada = null;
var valorAltura = 5;
var valorVelocidad = 0;
var valorFuel = 100;
var aceleracion = gravedad;

// Variables Atajos Marcadores
var indicadorAltura = null;
var indicadorVelocidadD = null;
var indicadorVelocidadM = null;
var indicadorFuel = null;

// Variables Convertidas para Marcadores
var valorRotacion = 43;
var medidaRotacion = "rotate(" + valorRotacion + "deg)";
var medidaAltura = valorAltura + "%";
var medidaFuel = valorFuel + "%";

// Variables Atajos Colores
var naranja = "rgb(225, 75, 0)";
var azul = "rgb(0, 167, 208)";

// Eventos
window.onload = function () {

    // Atajos indicadores
    indicadorAltura = document.getElementById("fondoAltura");
    indicadorVelocidadD = document.getElementById("imgAguja");
    indicadorVelocidadM = document.getElementById("velM");
    indicadorFuel = document.getElementById("fondoFuel");

    // Botón menú
    document.getElementById("botMenu").onclick = function () {
        if (menuVisible) {
            document.getElementById("menu").style.display = "none";
            document.getElementById("botMenu").src = "img/botonMenuPause.png";
            menuVisible = false;
            aterrizadoPausado = false;
            start();
        } else {
            document.getElementById("menu").style.display = "block";
            document.getElementById("botMenu").src = "img/botonMenuPlay.png";
            menuVisible = true;
            aterrizadoPausado = true;
            stop();
        }
    };

    // Botones de reinicio
    document.getElementById("botRestart").onclick = function () {
        restart();
    };
    document.getElementById("botResPos").onclick = function () {
        restart();
    };
    document.getElementById("botResNeg").onclick = function () {
        restart();
    };

    // Botones de About/Instrucciones
    document.getElementById("botAbout").onclick = function () {
        var cambiar = document.getElementById("textConfirm").innerHTML.replace("Instrucciones", "About");
        document.getElementById("textConfirm").innerHTML = cambiar;
        pagina = "about";
        document.getElementById("confirmacion").style.display = "block";
    };
    document.getElementById("botInstruc").onclick = function () {
        var cambiar = document.getElementById("textConfirm").innerHTML.replace("About", "Instrucciones");
        document.getElementById("textConfirm").innerHTML = cambiar;
        pagina = "instructions";
        document.getElementById("confirmacion").style.display = "block";
    };
    document.getElementById("botConfirm").onclick = function () {
        location.href = pagina + ".html";
    };
    document.getElementById("botCancel").onclick = function () {
        document.getElementById("confirmacion").style.display = "none";
    };

    // Botones de dificultad (dentro del menú)
    document.getElementById("botFacil").onclick = function () {
        modoDificil = false;
        prepararDificultad();
        restart();
    };
    document.getElementById("botDificil").onclick = function () {
        modoDificil = true;
        prepararDificultad();
        restart();
    };

    // Cambiar Nave (Xml Version)
    document.getElementById("botBlanco").onclick = function () {
        colorNave = "blanco";
        prepararNave();
    };
    document.getElementById("botAmarillo").onclick = function () {
        colorNave = "amarillo";
        prepararNave();
    };

    // Teclas de Guardar y Cargar (Xml Version) (JQuery)
    $(document).keypress(function (e) {
        if (e.which === 103) {
            guardarConfiguracion();
        }
        if (e.which === 99) {
            cargarConfiguracion();
        }
    });

    // Encender/Apagar el motor al mantener pulsada la luna (Mouse)
    document.getElementById("luna").onmousedown = motorOn;
    document.getElementById("luna").onmouseup = motorOff;

    // Encender/Apagar el motor al mantener pulsada la luna (Touch)
    document.getElementById("luna").oncontextmenu = function (e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    };
    document.getElementById("luna").addEventListener("touchstart", function (e) {
        motorOn();
    });
    document.getElementById("luna").addEventListener("touchend", function (e) {
        motorOff();
    });
};

// Funciones
function cargarConfiguracion() {
    var url = "defaultServlet";
    var emess = "Error de lectura";
    $.ajax({
        type: "get",
        url: url,
        dataType: "json",
        success: function (dataJson) {
            jsonObject = dataJson;
            leerJson();
        },
        error: function (e) {
            if (e["responseJSON"] === undefined)
                alert(emess);
            else
                alert(e["responseJSON"]["error"]);
        }
    });
}

function leerJson() {
    var promptString = "Escribe el nombre de la configuración que deseas cargar.\n\n";

    for (i = 0; i < jsonObject.length; i++) {
        var nombre = jsonObject[i].nombre;
        var mDif = jsonObject[i].modoDificil;
        var cNave = jsonObject[i].colorNave;
        var newString = nombre + " - ModoDifícil " + mDif + " y colorNave " + cNave + "\n";
        promptString += newString;
    }

    var configDeseada = prompt(promptString);
    var encontrada = false;

    for (i = 0; i < jsonObject.length; i++) {
        var nombre = jsonObject[i].nombre;
        var mDif = jsonObject[i].modoDificil;
        var cNave = jsonObject[i].colorNave;
        if (nombre === configDeseada) {
            aplicarConfiguracion(mDif, cNave);
            encontrada = true;
        }
    }

    if (!encontrada) {
        alert("La configuración introducida no existe");
    }
}

function aplicarConfiguracion(mDif, cNave) {
    if (mDif === "false") {
        modoDificil = false;
    } else {
        modoDificil = true;
    }
    prepararDificultad();
    colorNave = cNave;
    prepararNave();
    restart();
}

function guardarConfiguracion() {
    if (modoDificil === true) {
        var dificultad = "difícil";
    } else {
        var dificultad = "fácil";
    }
    var nombreConfig = prompt("¿Con qué nombre quieres guardar la siguiente configuración?\n\nNave de color " + colorNave + " y dificultad " + dificultad, "");
    escribirJson(nombreConfig);
}

function escribirJson(nombreConfig) {
    var url = "defaultServlet";
    var emess = "Error de escritura";
    $.ajax({
        method: "POST",
        url: url,
        data: {nombre: nombreConfig, modoDificil: modoDificil, colorNave: colorNave},
        success: function (u) {
            alert(u["mess"]);
        },
        error: function (e) {
            if (e["responseJSON"] === undefined)
                alert(emess);
            else
                alert(e["responseJSON"]["error"]);
        }
    });
}

function prepararDificultad() {
    if (modoDificil === true) {
        valorFuel = 50;
        limiteVelocidad = 5;
        document.getElementById("botDificil").style.backgroundColor = naranja;
        document.getElementById("botDificil").style.color = "white";
        document.getElementById("botFacil").style.backgroundColor = azul;
        document.getElementById("botFacil").style.color = "black";
        document.getElementById("velD").src = "img/indicadorVelocidadPcDificil.png";
    } else {
        valorFuel = 100;
        limiteVelocidad = 10;
        document.getElementById("botFacil").style.backgroundColor = naranja;
        document.getElementById("botFacil").style.color = "white";
        document.getElementById("botDificil").style.backgroundColor = azul;
        document.getElementById("botDificil").style.color = "black";
        document.getElementById("velD").src = "img/indicadorVelocidadPcFacil.png";
    }
    medidaFuel = valorFuel + "%";
    indicadorFuel.style.height = medidaFuel;
    indicadorFuel.style.width = medidaFuel;
}

/* Xml Version */
function prepararNave() {
    if (colorNave === "blanco") {
        document.getElementById("botBlanco").style.backgroundColor = naranja;
        document.getElementById("botBlanco").style.color = "white";
        document.getElementById("botAmarillo").style.backgroundColor = azul;
        document.getElementById("botAmarillo").style.color = "black";
        naveNormal = "img/coheteBlanco.png";
        naveMotor = "img/coheteBlancoFuegoGif.gif";
        naveExplotada = "img/coheteBlancoExplosion.png";
    }
    if (colorNave === "amarillo") {
        document.getElementById("botAmarillo").style.backgroundColor = naranja;
        document.getElementById("botAmarillo").style.color = "white";
        document.getElementById("botBlanco").style.backgroundColor = azul;
        document.getElementById("botBlanco").style.color = "black";
        naveNormal = "img/coheteAmarillo.png";
        naveMotor = "img/coheteAmarilloFuegoGif.gif";
        naveExplotada = "img/coheteAmarilloExplosion.png";
    }
    document.getElementById("nave").src = naveNormal;
}

function recordatorioDificultad() {
    if (modoDificil === true) {
        document.getElementById("difi").innerHTML = "Difícil";
    } else {
        document.getElementById("difi").innerHTML = "Fácil";
    }
    setTimeout(function () {
        document.getElementById("difi").innerHTML = "&nbsp;";
    }, 1000);
}

function start() {
    recordatorioDificultad();
    temporizador = setInterval(function () {
        moverNave();
    }, dt * 1000);
}

function stop() {
    clearInterval(temporizador);
}

function moverNave() {

    // Cambian los Valores de Velocidad y Altura
    valorVelocidad += aceleracion * dt;
    valorAltura += valorVelocidad * dt;

    // Se actualiza la Velocidad en Escritorio
    valorRotacion = 43 + Math.abs(valorVelocidad * 9.25);
    if (valorRotacion > 312) {
        valorRotacion = 312;
    }
    medidaRotacion = "rotate(" + valorRotacion + "deg)";
    indicadorVelocidadD.style.transform = medidaRotacion;

    // Se actualiza la Velocidad en Movil
    if (Math.abs(valorVelocidad) <= 5) {
        document.getElementById("velM").src = "img/velocidadVerde.png";
    } else if (Math.abs(valorVelocidad) <= 10) {
        document.getElementById("velM").src = "img/velocidadAmarillo.png";
    } else {
        document.getElementById("velM").src = "img/velocidadRojo.png";
    }

    // Se actualiza la Altura
    if (valorAltura > 0) {
        medidaAltura = ((97 * valorAltura) / 70) + "%";
    } else {
        medidaAltura = "1%";
    }
    indicadorAltura.style.top = medidaAltura;

    // Aterrizar la Nave al llegar a la luna
    if (valorAltura < 70) {
        document.getElementById("divCentral").style.top = valorAltura + "%";
    } else {
        if (valorVelocidad > limiteVelocidad) {
            document.getElementById("nave").src = naveExplotada;
            var cambiar = document.getElementById("textResNeg").innerHTML.replace("xxx", Math.round(valorVelocidad));
            document.getElementById("textResNeg").innerHTML = cambiar;
            document.getElementById("resultadoNeg").style.display = "block";
        } else {
            document.getElementById("nave").src = naveNormal;
            var cambiar = document.getElementById("textResPos").innerHTML.replace("xxx", Math.round(valorVelocidad));
            document.getElementById("textResPos").innerHTML = cambiar;
            document.getElementById("resultadoPos").style.display = "block";
        }
        aterrizadoPausado = true;
        stop();
    }
}

function motorOn() {
    if (aterrizadoPausado === true || fuelOut === true) {
        motorOff();
    } else {
        aceleracion = -gravedad;
        if (temporizadorFuel === null) {
            temporizadorFuel = setInterval(function () {
                actualizarFuel();
            }, 10);
            document.getElementById("nave").src = naveMotor;
        }
    }
}

function motorOff() {
    aceleracion = gravedad;
    clearInterval(temporizadorFuel);
    temporizadorFuel = null;
    if (aterrizadoPausado === false) {
        document.getElementById("nave").src = naveNormal;
    }
}

function actualizarFuel() {
    valorFuel -= 0.1;
    if (valorFuel < 0) {
        valorFuel = 0;
        fuelOut = true;
        motorOff();
    }
    medidaFuel = valorFuel + "%";
    indicadorFuel.style.height = medidaFuel;
    indicadorFuel.style.width = medidaFuel;
}

function restart() {
    clearInterval(temporizador);
    // Reseteo de imágenes y variables
    document.getElementById("resultadoPos").style.display = "none";
    document.getElementById("resultadoNeg").style.display = "none";
    document.getElementById("menu").style.display = "none";
    document.getElementById("botMenu").src = "img/botonMenuPause.png";
    document.getElementById("nave").src = naveNormal;
    menuVisible = false;
    aterrizadoPausado = false;
    fuelOut = false;
    temporizador = null;
    temporizadorFuel = null;
    aceleracion = gravedad;
    // Reseteo de marcadores
    valorAltura = 5;
    valorVelocidad = 0;
    if (modoDificil === true) {
        valorFuel = 50;
    } else {
        valorFuel = 100;
    }
    // Actualización de marcadores
    document.getElementById("divCentral").style.top = valorAltura + "%";
    medidaAltura = ((97 * valorAltura) / 70) + "%";
    indicadorAltura.style.top = medidaAltura;
    valorRotacion = 43 + Math.abs(valorVelocidad * 9.25);
    medidaRotacion = "rotate(" + valorRotacion + "deg)";
    indicadorVelocidadD.style.transform = medidaRotacion;
    document.getElementById("velM").src = "img/velocidadVerde.png";
    medidaFuel = valorFuel + "%";
    indicadorFuel.style.height = medidaFuel;
    indicadorFuel.style.width = medidaFuel;
    // Empezamos de nuevo
    start();
}