const camposDiv = document.getElementById("campos");
const tipoCalc = document.getElementById("tipoCalc");
const historialUl = document.getElementById("historial");
const toggleTemaBtn = document.getElementById("toggleTema");
let graficaCtx = document.getElementById("grafica").getContext("2d");

let historial = JSON.parse(localStorage.getItem("historialQuimica")) || [];
let grafica;

function mostrarCampos() {
  let tipo = tipoCalc.value;
  let html = "";

  switch(tipo) {
    case "molaridad":
      html = `
        <label>Moles (mol):</label>
        <input type="number" id="moles">
        <label>Volumen (L o mL):</label>
        <input type="number" id="volumen">
        <select id="unidadVol">
          <option value="L">L</option>
          <option value="mL">mL</option>
        </select>
      `;
      break;

    case "normalidad":
      html = `
        <label>Equivalente (eq):</label>
        <input type="number" id="equivalente">
        <label>Volumen (L o mL):</label>
        <input type="number" id="volumen">
        <select id="unidadVol">
          <option value="L">L</option>
          <option value="mL">mL</option>
        </select>
      `;
      break;

    case "dilucion":
      html = `
        <label>Concentración inicial (C1):</label>
        <input type="number" id="C1">
        <label>Volumen inicial (V1 L o mL):</label>
        <input type="number" id="V1">
        <select id="unidadV1">
          <option value="L">L</option>
          <option value="mL">mL</option>
        </select>

        <label>Concentración final (C2) [Deja vacío si quieres calcular]:</label>
        <input type="number" id="C2">
        <label>Volumen final (V2 L o mL) [Deja vacío si quieres calcular]:</label>
        <input type="number" id="V2">
        <select id="unidadV2">
          <option value="L">L</option>
          <option value="mL">mL</option>
        </select>
      `;
      break;

    case "masa":
      html = `
        <label>Moles (mol):</label>
        <input type="number" id="moles">
        <label>Masa molar (g o mg):</label>
        <input type="number" id="masaMolar">
        <select id="unidadMasaMolar">
          <option value="g">g</option>
          <option value="mg">mg</option>
        </select>
      `;
      break;

    case "moles":
      html = `
        <label>Masa (g o mg):</label>
        <input type="number" id="masa">
        <label>Masa molar (g o mg):</label>
        <input type="number" id="masaMolar">
        <select id="unidadMasa">
          <option value="g">g</option>
          <option value="mg">mg</option>
        </select>
        <select id="unidadMasaMolar">
          <option value="g">g</option>
          <option value="mg">mg</option>
        </select>
      `;
      break;

    case "pureza":
      html = `
        <label>Masa sustancia pura (g o mg):</label>
        <input type="number" id="masaPura">
        <label>Masa muestra (g o mg):</label>
        <input type="number" id="masaMuestra">
        <select id="unidadPura">
          <option value="g">g</option>
          <option value="mg">mg</option>
        </select>
        <select id="unidadMuestra">
          <option value="g">g</option>
          <option value="mg">mg</option>
        </select>
      `;
      break;

    case "titulacion":
      html = `
        <label>Volumen titulado (L o mL):</label>
        <input type="number" id="Vt">
        <select id="unidadVt">
          <option value="L">L</option>
          <option value="mL">mL</option>
        </select>
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

// Toggle tema
toggleTemaBtn.onclick = () => {
  if(document.documentElement.style.getPropertyValue('--bg-color') === '#0f172a') {
    document.documentElement.style.setProperty('--bg-color','#f5f5f5');
    document.documentElement.style.setProperty('--container-color','#ffffff');
    document.documentElement.style.setProperty('--text-color','#111827');
    document.documentElement.style.setProperty('--btn-color','#3b82f6');
    document.documentElement.style.setProperty('--btn-hover','#2563eb');
  } else {
    document.documentElement.style.setProperty('--bg-color','#0f172a');
    document.documentElement.style.setProperty('--container-color','#1e293b');
    document.documentElement.style.setProperty('--text-color','white');
    document.documentElement.style.setProperty('--btn-color','#22c55e');
    document.documentElement.style.setProperty('--btn-hover','#16a34a');
  }
};

// Función principal de cálculo
function calcular() {
  let tipo = tipoCalc.value;
  let resultado = "";

  try {
    switch(tipo){
      case "molaridad":
        let moles = parseFloat(document.getElementById("moles").value);
        let volumen = parseFloat(document.getElementById("volumen").value);
        let unidadVol = document.getElementById("unidadVol").value;
        if(unidadVol === "mL") volumen /= 1000; // conversión a L
        if(!moles || !volumen) throw "Completa todos los campos";
        resultado = `Molaridad: ${(moles/volumen).toFixed(3)} M`;
        break;

      case "dilucion":
        let C1 = parseFloat(document.getElementById("C1").value);
        let V1 = parseFloat(document.getElementById("V1").value);
        let unidadV1 = document.getElementById("unidadV1").value;
        if(unidadV1==="mL") V1 /= 1000;
        let C2 = parseFloat(document.getElementById("C2").value);
        let V2 = parseFloat(document.getElementById("V2").value);
        let unidadV2 = document.getElementById("unidadV2").value;
        if(unidadV2==="mL" && V2) V2 /= 1000;

        if(C2 && !V2) resultado = `Volumen final: ${(C1*V1/C2).toFixed(3)} L`;
        else if(!C2 && V2) resultado = `Concentración final: ${(C1*V1/V2).toFixed(3)} M`;
        else throw "Rellena solo C2 o V2";

        // Graficar
        crearGraficaDilucion(C1,V1,C2,V2);
        break;

      // Otros cálculos aquí (normalidad, moles, masa, pureza, titulación)
      // Puedes agregar conversiones como arriba
      default:
        resultado = "Funcionalidad en construcción...";
        break;
    }

    document.getElementById("resultado").innerText = resultado;
    agregarHistorial(resultado);
  } catch(e){
    alert(e);
  }
}

// Historial persistente
function agregarHistorial(texto){
  let fecha = new Date().toLocaleString();
  historial.unshift(`${fecha}: ${texto}`);
  if(historial.length>20) historial.pop();
  localStorage.setItem("historialQuimica", JSON.stringify(historial));
  renderHistorial();
}

function renderHistorial(){
  historialUl.innerHTML="";
  historial.forEach(item=>{
    let li=document.createElement("li");
    li.innerText=item;
    historialUl.appendChild(li);
  });
}

function borrarHistorial(){
  historial=[];
  localStorage.removeItem("historialQuimica");
  renderHistorial();
}

// Gráfica para dilución
function crearGraficaDilucion(C1,V1,C2,V2){
  if(grafica) grafica.destroy();
  let labels = ["Inicial","Final"];
  let data = [C1,C2 || C1*V1/(V2 || 1)];
  grafica = new Chart(graficaCtx,{
    type:"bar",
    data:{
      labels: labels,
      datasets:[{
        label:"Concentración (M)",
        data:data,
        backgroundColor:["#22c55e","#3b82f6"]
      }]
    },
    options:{
      responsive:true,
      plugins:{legend:{display:false}}
    }
  });
}

// Renderizar historial al cargar
renderHistorial();
