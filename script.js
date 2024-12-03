function getTrashcanStatus() {
    const trashcanId = document.getElementById('trashcan-id').value;
    fetch(`/api/trashcans/${trashcanId}`)
      .then(response => response.json())
      .then(data => {
        document.getElementById('trashcan-status').textContent = `Bote ${data.trashcan_number} - Estado: ${data.status}, Aperturas: ${data.open_count}`;
      })
      .catch(error => {
        document.getElementById('trashcan-status').textContent = 'Error al consultar el estado';
      });
  }
  
  function openTrashcan() {
    const trashcanId = document.getElementById('trashcan-id').value;
    fetch(`/api/trashcans/${trashcanId}/open`, {
      method: 'POST',
    })
      .then(response => response.json())
      .then(data => {
        alert(`Estado actualizado: ${data.status}. Aperturas: ${data.open_count}`);
      })
      .catch(error => {
        alert('Error al abrir el bote: ' + error.message);
      });
  }
  