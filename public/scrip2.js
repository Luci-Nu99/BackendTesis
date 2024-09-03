document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const contactList = document.getElementById('contactList');
    const searchInput = document.getElementById('search');  
    let editingContactId = null; // Variable para almacenar el ID del contacto que se está editando
  
  
    // Función para obtener la lista de contactos desde el servidor
  const obtenerContactos = async (query = '') => {
    try {
      const response = await fetch(`/api/contactos?q=${query}`);
      const data = await response.json();
  
      contactList.innerHTML = ''; // Limpiar lista de contactos antes de actualizar
  
      data.forEach(contacto => {
        const contactItem = document.createElement('div');
        contactItem.classList.add('contenedores');
        contactItem.innerHTML = `
  
          <div class="cabeza">
          <div class="imagen-perfil">
            <div class="imagen-perfil_dd">
              <img class="imagen-dentro-ta" src="${contacto.foto}" alt="Foto de ${contacto.nombre}">
            </div>
          </div>
          <div class="nombre-perfil">
            <strong>${contacto.nombre} ${contacto.apellidos}</strong>
          </div>
        </div>
  
        <div class="datos-en">
            <p class="datos-enn">Correo electronico :</p>
            <p class="datos-2">${contacto.correo}</p>
            <p class="datos-enn">Fecha de Nacimiento :</p>
            <p class="datos-2">${new Date(contacto.fecha_nac).toLocaleDateString()}</p>
            
        </div>
        <div class="botones-dentro">
            <div class="button-edit">
              <button  class="eliminar-btn" data-id="${contacto._id}">Eliminar</button>
            </div>
            <div class="button-delete">
              <button class="editar-btn" type="button" data-toggle="modal" data-target="#exampleModalLong" data-id="${contacto._id}">Editar</button>
            </div>
        </div>
        `;
        contactList.appendChild(contactItem);
      });
  
  
      
  
      // Agregar listeners para los botones de editar y eliminar
      contactList.querySelectorAll('.eliminar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          eliminarContacto(id);
        });
      });
  
      contactList.querySelectorAll('.editar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          cargarContactoParaEdicion(id);
        });
      });
  
    } catch (error) {
      console.error('Error al obtener la lista de contactos:', error);
    }
  };
  
  
  
  
  
   // Función para manejar el evento de búsqueda en tiempo real
   searchInput.addEventListener('input', () => {
    const query = searchInput.value;
    obtenerContactos(query);
  });
  
  
  
  // Función para cargar los datos del contacto en el formulario para editar
  const cargarContactoParaEdicion = async (id) => {
    try {
      const response = await fetch(`/api/contactos/${id}`);
      const data = await response.json();
  
      // Llenar el formulario con los datos del contacto
      document.getElementById('nombre').value = data.nombre;
      document.getElementById('apellidos').value = data.apellidos;
      document.getElementById('correo').value = data.correo;
      document.getElementById('fecha_nac').value = new Date(data.fecha_nac).toISOString().substring(0, 10);
  
      // Mostrar la imagen actual (opcional, sólo para referencia visual)
      const fotoPreview = document.getElementById('foto-preview');
      const fotogeneral= document.getElementById('foto_general');
      if (fotoPreview) {
        fotoPreview.src = data.foto;
        fotoPreview.style.display = 'block';
        fotogeneral.style.display='block';
      } else {
        const imgElement = document.createElement('img');
        imgElement.id = 'foto-preview';
        imgElement.src = data.foto;
        imgElement.style.display = 'block';
        document.getElementById('contactForm').appendChild(imgElement);
      }
  
  
      // Establecer el ID del contacto que se está editando
      editingContactId = id;
  
  
      // Cambiar el texto y comportamiento del botón de enviar
      const submitBtn = document.querySelector('button[type="submit"]');
      
      submitBtn.textContent = 'Editar Contacto';
      submitBtn.removeEventListener('click', enviarFormulario);
      submitBtn.addEventListener('click', editarContactoExistente);
      
    
      // Opcional: Mostrar un mensaje o cambiar de vista para enfocar la edición
      alert('Ahora estás editando el contacto seleccionado.');
    } catch (error) {
      console.error('Error al cargar contacto para edición:', error);
    }
  };
  
  
  
    // Función para enviar datos del formulario al servidor
    const enviarFormulario = async (event) => {
      event.preventDefault();
  
      const nombre = document.getElementById('nombre').value;
      const apellidos = document.getElementById('apellidos').value;
      const correo = document.getElementById('correo').value;
      const fecha_nac = document.getElementById('fecha_nac').value;
      const foto = document.getElementById('foto').files[0];
  
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('apellidos', apellidos);
      formData.append('correo', correo);
      formData.append('fecha_nac', fecha_nac);
      formData.append('foto', foto);
  
      try {
        const response = await fetch('/api/contactos', {
          method: 'POST',
          body: formData,
          
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log('Contacto creado:', data.contacto);
          alert('Datos agregados correctamente.'); // Mensaje de éxito
          obtenerContactos();
          contactForm.reset();
        } else {
          const errorData = await response.json();
          if (response.status === 400) {
            alert(errorData.error); // Mostrar mensaje de error específico del servidor
          } else {
            console.log('Error al crear el contacto:', response.statusText);
            alert('Hubo un error al enviar el formulario. Por favor, intenta de nuevo.'); // Mensaje de error genérico
          }
        }
      } catch (error) {
        console.log('Error al enviar el formulario:', error);
        console.log('Error al enviar el formulario:', error);
        alert('Hubo un error al enviar el formulario. Por favor, intenta de nuevo.');
      }
      console.log('si entra')
    };
  
    // Función para eliminar un contacto
    const eliminarContacto = async (id) => {
      try {
        const response = await fetch(`/api/contactos/${id}`, {
          method: 'DELETE'
        });
    
        if (response.ok) {
          console.log('Contacto eliminado correctamente.');
          obtenerContactos(); // Actualizar la lista después de eliminar
        } else {
          console.error('Error al eliminar el contacto:', response.statusText);
        }
      } catch (error) {
        console.error('Error al eliminar el contacto:', error);
      }
    };
  
    // Función para enviar datos del formulario al servidor (Editar contacto existente)
  const editarContactoExistente = async (event) => {
    event.preventDefault();
  
    const nombre = document.getElementById('nombre').value;
    const apellidos = document.getElementById('apellidos').value;
    const correo = document.getElementById('correo').value;
    const fecha_nac = document.getElementById('fecha_nac').value;
    const foto = document.getElementById('foto').files[0];
  
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('apellidos', apellidos);
    formData.append('correo', correo);
    formData.append('fecha_nac', fecha_nac);
    formData.append('foto', foto);
  
    try {
      const response = await fetch(`/api/contactos/${editingContactId}`, {
        method: 'PUT', // Usar PUT para actualizar un recurso
        body: formData,
      });
      
      
  
      if (response.ok) {
        const data = await response.json();
        const fotoPreview = document.getElementById('foto-preview');
        fotoPreview.style.display = 'none';
        const fotogeneral= document.getElementById('foto_general');
        fotogeneral.style.display = 'none'
        alert('Contacto actualizado correctamente.');
        obtenerContactos();
        contactForm.reset();
  
        // Restaurar el formulario para crear un nuevo contacto
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Crear Contacto';
        submitBtn.removeEventListener('click', editarContactoExistente);
        submitBtn.addEventListener('click', enviarFormulario);
      } else {
        const errorData = await response.json();
        if (response.status === 400) {
          alert(errorData.error);
        } else {
          console.log('Error al actualizar el contacto:', response.statusText);
          alert('Hubo un error al enviar el formulario de edición. Por favor, intenta de nuevo.');
        }
      }
    } catch (error) {
      console.error('Error al enviar el formulario de edición:', error);
      alert('Hubo un error al enviar el formulario de edición. Por favor, intenta de nuevo.');
    }
  };
  
  // Función para manejar el evento de búsqueda en tiempo real
  searchInput.addEventListener('input', () => {
    const query = searchInput.value;
    obtenerContactos(query);
  });
  
    // Llamar a obtenerContactos al cargar la página
    obtenerContactos();
  
    // Escuchar el evento submit del formulario
    contactForm.addEventListener('submit', enviarFormulario);
  });
  