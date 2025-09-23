function mostrarSeccion(seccion) {
  document.querySelectorAll('.seccion').forEach(sec => sec.style.display = 'none');
  document.getElementById(seccion).style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (seccion === 'votacion-nominados') {
    // Limpiar antes de rellenar para evitar duplicados
    document.getElementById('lista-nominados-1').innerHTML = '';
    document.getElementById('lista-nominados-2').innerHTML = '';

    crearApartadoNominaciones('lista-nominados-1', 'enviarNominados1', 'nominaciones_soltero');
    crearApartadoNominaciones('lista-nominados-2', 'enviarNominados2', 'nominaciones_otro');
  }
}

function crearApartadoNominaciones(idLista, idBoton, coleccionFirebase) {
  const contenedor = document.getElementById(idLista);
  const participantes = document.querySelectorAll('#participantes .participante');

  // Generar candidatos
  participantes.forEach(part => {
    const nombre = part.querySelector('h3').innerText.trim();
    const foto = part.querySelector('img').src;
    const div = document.createElement('div');
    div.classList.add('nominado');
    div.dataset.nombre = nombre;
    div.innerHTML = `<img src="${foto}" alt="${nombre}"><span>${nombre}</span>`;
    contenedor.appendChild(div);
  });

  // Lógica de selección
  const maxSeleccion = 3;
  let seleccionados = [];
  contenedor.querySelectorAll('.nominado').forEach(item => {
    item.addEventListener('click', () => {
      const nombre = item.dataset.nombre;
      if (item.classList.contains('selected')) {
        item.classList.remove('selected');
        seleccionados = seleccionados.filter(n => n !== nombre);
      } else {
        if (seleccionados.length >= maxSeleccion) {
          alert(`Solo puedes seleccionar ${maxSeleccion} nominados.`);
          return;
        }
        item.classList.add('selected');
        seleccionados.push(nombre);
      }
    });
  });

  // Guardar en Firebase
  document.getElementById(idBoton).addEventListener('click', async () => {
    if (seleccionados.length === 0) {
      alert("Debes seleccionar al menos un nominado.");
      return;
    }
    try {
      await addDoc(collection(db, coleccionFirebase), {
        usuario: usuarioActual,
        nominados: seleccionados,
        fecha: serverTimestamp()
      });
      alert("¡Tus nominaciones han sido registradas!");
      contenedor.querySelectorAll('.nominado').forEach(n => n.classList.remove('selected'));
      seleccionados = [];
    } catch (e) {
      console.error("Error guardando nominaciones: ", e);
      alert("Hubo un error al guardar tus nominaciones.");
    }
  });
}

  // Guardar la selección de cada categoría
  const votosSeleccionados = {};
  
  document.querySelectorAll('.voto').forEach(btn => {
    btn.addEventListener('click', () => {
      const categoria = btn.dataset.categoria;
      const nominado = btn.dataset.nominado;
  
      // Guardar voto
      votosSeleccionados[categoria] = nominado;
  
      // Quitar clase selected de todos en la categoría
      document.querySelectorAll(`.voto[data-categoria="${categoria}"]`).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
  
  document.getElementById('enviarVoto').addEventListener('click', () => {
    const categorias = ["Mejor amigo", "Más divertido", "Más creativo"];
    for (let cat of categorias) {
      if (!votosSeleccionados[cat]) {
        alert(`Debes seleccionar un participante para "${cat}"`);
        return;
      }
    }
  
    // Guardar en Firebase
    Object.keys(votosSeleccionados).forEach(cat => {
      db.collection("votos").add({
        categoria: cat,
        nominado: votosSeleccionados[cat],
        fecha: firebase.firestore.FieldValue.serverTimestamp()
      });
    });
  
    alert("¡Tus votos han sido registrados!");
    votosSeleccionados = {};
    document.querySelectorAll('.voto').forEach(b => b.classList.remove('selected'));
  });
  
  