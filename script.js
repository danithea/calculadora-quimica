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
        <label>Concentración inicial (C1 M):</label>
        <input type="number" id="C1">
        <label>Volumen inicial (V1 L o mL):</label>
        <input type="number" id="V1">
        <select id="unidadV1">
          <option value="L">L</option>
          <option value="mL">mL</option>
        </select>

        <label>Concentración final (C2 M) [opcional]:</label>
        <input type="number" id="C2">
        <label>Volumen final (V2 L o mL) [opcional]:</label>
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

// Toggle tema claro/osuro
toggleTemaBtn.onclick = () => {
  if(document.body.getAttribute("data-theme") === "claro"){
    document.body.removeAttribute("data-theme"); // vuelve a oscuro
  } else {
    document.body.setAttribute("data-theme","claro"); // activa tema claro
  }
};


// Función principal
function calcular() {
  let tipo = tipoCalc.value;
  let resultado = "";

  try {
    switch(tipo){
      case "molaridad":
        let moles = parseFloat(document.getElementById("moles").value);
        let volumen = parseFloat(document.getElementById("volumen").value);
        let unidadVol = document.getElementById("unidadVol").value;
        if(unidadVol === "mL") volumen /= 1000;
        if(!moles || !volumen) throw "Completa todos los campos";
        resultado = `Molaridad: ${(moles/volumen).toFixed(3)} M`;
        break;

      case "normalidad":
        let eq = parseFloat(document.getElementById("equivalente").value);
        let vol = parseFloat(document.getElementById("volumen").value);
        let unidadVolN = document.getElementById("unidadVol").value;
        if(unidadVolN==="mL") vol/=1000;
        if(!eq || !vol) throw "Completa todos los campos";
        resultado = `Normalidad: ${(eq/vol).toFixed(3)} N`;
        break;

      case "dilucion":
        let C1 = parseFloat(document.getElementById("C1").value);
        let V1 = parseFloat(document.getElementById("V1").value);
        let unidadV1 = document.getElementById("unidadV1").value;
        if(unidadV1==="mL") V1 /= 1000;
        let C2 = parseFloat(document.getElementById("C2").value);
        let V2 = parseFloat(document.getElementById("V2").value);
        let unidadV2 = document.getElementById("unidadV2").value;
        if(unidadV2==="mL" && V2) V2/=1000;

        if(C2 && !V2) resultado = `Volumen final: ${(C1*V1/C2).toFixed(3)} L`;
        else if(!C2 && V2) resultado = `Concentración final: ${(C1*V1/V2).toFixed(3)} M`;
        else if(C2 && V2) resultado = `Verifica los valores, solo deja vacío C2 o V2`;
        else throw "Completa al menos C2 o V2";

        crearGraficaDilucion(C1,V1,C2,V2);
        break;

      case "masa":
        let molesM = parseFloat(document.getElementById("moles").value);
        let masaMolar = parseFloat(document.getElementById("masaMolar").value);
        let unidadMM = document.getElementById("unidadMasaMolar").value;
        if(unidadMM==="mg") masaMolar/=1000;
        if(!molesM || !masaMolar) throw "Completa todos los campos";
        resultado = `Masa: ${(molesM*masaMolar).toFixed(3)} g`;
        break;

      case "moles":
        let masa = parseFloat(document.getElementById("masa").value);
        let masaMolar2 = parseFloat(document.getElementById("masaMolar").value);
        let unidadM = document.getElementById("unidadMasa").value;
        let unidadMM2 = document.getElementById("unidadMasaMolar").value;
        if(unidadM==="mg") masa/=1000;
        if(unidadMM2==="mg") masaMolar2/=1000;
        if(!masa || !masaMolar2) throw "Completa todos los campos";
        resultado = `Moles: ${(masa/masaMolar2).toFixed(3)} mol`;
        break;

      case "pureza":
        let masaPura = parseFloat(document.getElementById("masaPura").value);
        let masaMuestra = parseFloat(document.getElementById("masaMuestra").value);
        let unidadPura = document.getElementById("unidadPura").value;
        let unidadMuestra = document.getElementById("unidadMuestra").value;
        if(unidadPura==="mg") masaPura/=1000;
        if(unidadMuestra==="mg") masaMuestra/=1000;
        if(!masaPura || !masaMuestra) throw "Completa todos los campos";
        resultado = `Pureza: ${((masaPura/masaMuestra)*100).toFixed(2)} %`;
        break;

      case "titulacion":
        let Vt = parseFloat(document.getElementById("Vt").value);
        let unidadVt = document.getElementById("unidadVt").value;
        if(unidadVt==="mL") Vt/=1000;
        let Mt = parseFloat(document.getElementById("Mt").value);
        let eqTitulacion = parseFloat(document.getElementById("eq").value);
        if(!Vt || !Mt || !eqTitulacion) throw "Completa todos los campos";
        let Ct = (Vt * Mt) / eqTitulacion;
        resultado = `Concentración titulada: ${Ct.toFixed(3)} M`;
        crearGraficaTitulacion(Vt*1000, Ct); // gráfico opcional
        break;
    }

    document.getElementById("resultado").innerText = resultado;
    agregarHistorial(resultado);

  } catch(e){
    alert(e);
  }
}

// Historial
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

// Gráficas
function crearGraficaDilucion(C1,V1,C2,V2){
  if(grafica) grafica.destroy();
  let labels = ["Inicial","Final"];
  let data = [C1,C2 || (C1*V1/(V2||1))];
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

function crearGraficaTitulacion(V,C){
  if(grafica) grafica.destroy();
  grafica = new Chart(graficaCtx,{
    type:"line",
    data:{
      labels:["Volumen agregado","Resultado"],
      datasets:[{
        label:"Concentración (M)",
        data:[V,C],
        backgroundColor:["#22c55e","#3b82f6"],
        borderColor:"#22c55e",
        fill:false,
        tension:0.3
      }]
    },
    options:{responsive:true}
  });
}

// Renderizar historial al cargar
renderHistorial();
