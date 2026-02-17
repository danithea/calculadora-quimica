const camposDiv = document.getElementById("campos");
const tipoCalc = document.getElementById("tipoCalc");
const historialUl = document.getElementById("historial-list");

let historial = [];
try {
  historial = JSON.parse(localStorage.getItem("historialQuimica")) || [];
} catch(e) {
  console.warn("No se pudo acceder al localStorage:", e);
}

// Renderizar historial al cargar la página
renderHistorial();

function mostrarCampos() {
  let tipo = tipoCalc.value;
  let html = "";

  switch(tipo) {
    case "molaridad":
      html = `
        <label>Moles (mol):</label>
        <input type="number" id="moles">
        <label>Volumen (L):</label>
        <input type="number" id="volumen">
      `;
      break;

    case "normalidad":
      html = `
        <label>Equivalente (eq):</label>
        <input type="number" id="equivalente">
        <label>Volumen (L):</label>
        <input type="number" id="volumen">
      `;
      break;

    case "dilucion":
      html = `
        <label>Concentración inicial (C1):</label>
        <input type="number" id="C1">
        <label>Volumen inicial (V1):</label>
        <input type="number" id="V1">
        <label>Concentración final (C2) [Deja vacío si quieres calcular]:</label>
        <input type="number" id="C2">
        <label>Volumen final (V2) [Deja vacío si quieres calcular]:</label>
        <input type="number" id="V2">
      `;
      break;

    case "masa":
      html = `
        <label>Moles (mol):</label>
        <input type="number" id="moles">
        <label>Masa molar (g/mol):</label>
        <input type="number" id="masaMolar">
      `;
      break;

    case "moles":
      html = `
        <label>Masa (g):</label>
        <input type="number" id="masa">
        <label>Masa molar (g/mol):</label>
        <input type="number" id="masaMolar">
      `;
      break;

    case "pureza":
      html = `
        <label>Masa sustancia pura (g):</label>
        <input type="number" id="masaPura">
        <label>Masa muestra (g):</label>
        <input type="number" id="masaMuestra">
      `;
      break;

    case "titulacion":
      html = `
        <label>Volumen titulado (L):</label>
        <input type="number" id="Vt">
        <label>Concentración titulante (M):</label>
        <input type="number" id="Mt">
        <label>Equivalente del ácido/base:</label>
        <input type="number" id="eq">
      `;
      break;
  }

  camposDiv.innerHTML = html;
}

mostrarCampos();

function calcular() {
  let tipo = tipoCalc.value;
  let resultado = "";

  try {
    switch(tipo) {
      case "molaridad":
        let moles = parseFloat(document.getElementById("moles").value);
        let volumen = parseFloat(document.getElementById("volumen").value);
        if(!moles || !volumen) throw "Completa todos los campos";
        resultado = `Molaridad: ${(moles/volumen).toFixed(3)} M`;
        break;

      case "normalidad":
        let eq = parseFloat(document.getElementById("equivalente").value);
        let vol = parseFloat(document.getElementById("volumen").value);
        if(!eq || !vol) throw "Completa todos los campos";
        resultado = `Normalidad: ${(eq/vol).toFixed(3)} N`;
        break;

      case "dilucion":
        let C1 = parseFloat(document.getElementById("C1").value);
        let V1 = parseFloat(document.getElementById("V1").value);
        let C2 = parseFloat(document.getElementById("C2").value);
        let V2 = parseFloat(document.getElementById("V2").value);

        if(C2 && !V2) {
          resultado = `Volumen final: ${(C1*V1/C2).toFixed(3)} L`;
        } else if(!C2 && V2) {
          resultado = `Concentración final: ${(C1*V1/V2).toFixed(3)} M`;
        } else {
          throw "Rellena solo C2 o V2";
        }
        break;

      case "masa":
        let moles2 = parseFloat(document.getElementById("moles").value);
        let masaMolar = parseFloat(document.getElementById("masaMolar").value);
        if(!moles2 || !masaMolar) throw "Completa todos los campos";
        resultado = `Masa: ${(moles2*masaMolar).toFixed(3)} g`;
        break;

      case "moles":
        let masa = parseFloat(document.getElementById("masa").value);
        let masaMolar2 = parseFloat(document.getElementById("masaMolar").value);
        if(!masa || !masaMolar2) throw "Completa todos los campos";
        resultado = `Moles: ${(masa/masaMolar2).toFixed(3)} mol`;
        break;

      case "pureza":
        let masaPura = parseFloat(document.getElementById("masaPura").value);
        let masaMuestra = parseFloat(document.getElementById("masaMuestra").value);
        if(!masaPura || !masaMuestra) throw "Completa todos los campos";
        resultado = `Pureza: ${((masaPura/masaMuestra)*100).toFixed(2)} %`;
        break;

      case "titulacion":
        let Vt = parseFloat(document.getElementById("Vt").value);
        let Mt = parseFloat(document.getElementById("Mt").value);
        let eqT = parseFloat(document.getElementById("eq").value);
        if(!Vt || !Mt || !eqT) throw "Completa todos los campos";
        let Ct = (Vt*Mt)/eqT;
        resultado = `Concentración titulada: ${Ct.toFixed(3)} M`;
        break;
    }

    document.getElementById("resultado").innerText = resultado;
    agregarHistorial(resultado);
  } catch(e) {
    alert(e);
  }
}

// Historial
function agregarHistorial(texto) {
  let fecha = new Date().toLocaleString();
  historial.unshift(`${fecha}: ${texto}`);
  if(historial.length > 10) historial.pop();
  localStorage.setItem("historialQuimica", JSON.stringify(historial));
  renderHistorial();
}

function renderHistorial() {
  historialUl.innerHTML = "";
  historial.forEach(item => {
    let li = document.createElement("li");
    li.innerText = item;
    historialUl.appendChild(li);
  });
}

let ctx = document.getElementById('grafica').getContext('2d');
let grafica = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], // ejes X
        datasets: [{
            label: 'Concentración',
            data: [], // ejes Y
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34,197,94,0.2)',
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: { title: { display: true, text: 'Volumen (L)' } },
            y: { title: { display: true, text: 'Concentración (M)' } }
        }
    }
});

function actualizarGrafica(labels, data) {
    grafica.data.labels = labels;
    grafica.data.datasets[0].data = data;
    grafica.update();
}
