document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const progressContainer = document.getElementById("progressContainer");
    const progressFill = document.getElementById("progressFill");
    const progressText = document.getElementById("progressText");
    const btnClean = document.getElementById("btnClean");

    form.addEventListener("submit", function (e) {
        e.preventDefault(); // Evita el envío normal del formulario

        const formData = new FormData(form);
        const xhr = new XMLHttpRequest();

        // xhr.open("POST", form.action, true);
        // xhr.responseType = "blob"; // Para manejar la respuesta como archivo

        xhr.open("POST", "https://l75ytnbxsb.execute-api.us-east-1.amazonaws.com/prod/tmp/compress", true);
        xhr.responseType = "blob"; // Para manejar la respuesta como archivo
        // xhr.setRequestHeader("Accept", "application/json");
        // No pongas Content-Type manual si usas formData, deja que el navegador lo defina


        progressContainer.style.display = "block";

        xhr.upload.addEventListener("progress", function (e) {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                progressFill.style.width = percent + "%";
                progressText.textContent = percent + "%";
            }
        });

        xhr.onload = function () {
            if (xhr.status === 200) {
                progressText.textContent = "¡Completado!";
                // Descarga automática del archivo
                const blob = xhr.response;
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "archivo_comprimido.pdf"; // o como quieras llamarlo
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(downloadUrl);
            } else {
                progressText.textContent = "Error: " + xhr.status;
            }
        };

        xhr.onerror = function () {
            progressText.textContent = "Error de red";
        };

        xhr.send(formData);
    });

    // 🧼 Limpiar la barra de progreso al presionar "Limpiar"
    btnClean.addEventListener("click", function () {
        progressFill.style.width = "0%";
        progressText.textContent = "0%";
        progressContainer.style.display = "none";
    });


});
