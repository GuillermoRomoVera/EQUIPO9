document.addEventListener("DOMContentLoaded", () => {
    const addButton = document.getElementById("addApertura");
    const aperturasTable = document.getElementById("aperturasTable");
    const alert = document.getElementById("alert");

    // Cargar todas las aperturas
    const loadAperturas = async () => {
        const response = await fetch("/aperturas");
        const data = await response.json();

        // Mostrar mensaje si el bote está lleno
        if (data.message) {
            alert.textContent = data.message;
            alert.style.color = "red";
        } else {
            aperturasTable.innerHTML = data.aperturas
                .map(
                    (row) =>
                        `<tr>
                            <td>${row.id}</td>
                            <td>${row.apertura}</td>
                            <td>${row.estado}</td>
                        </tr>`
                )
                .join("");
        }
    };

    // Registrar una nueva apertura
    addButton.addEventListener("click", async () => {
        const response = await fetch("/aperturas", { method: "POST" });

        if (response.ok) {
            alert.textContent = "Apertura registrada.";
            alert.style.color = "green";
            loadAperturas();
        } else {
            const error = await response.json();
            alert.textContent = error.error;
            alert.style.color = "red";
        }
    });

    // Inicializar
    loadAperturas();
});
