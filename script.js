document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const selectBtn = document.getElementById('selectBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const resultContainer = document.getElementById('resultContainer');
    const resultMessage = document.getElementById('resultMessage');
    const downloadBtn = document.getElementById('downloadBtn');
    
    // Handle file selection via button
    selectBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        fileInput.click();
    });
    
    // Handle file input change
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleFile(this.files[0]);
        }
    });
    
    // Handle drag and drop
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', function() {
        this.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });
    
    // Handle the file
    function handleFile(file) {
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            showError('Por favor, sube solo archivos PDF.');
            return;
        }
        
        // Validate file size (max 25MB)
        if (file.size > 25 * 1024 * 1024) {
            showError('El archivo es demasiado grande. El tamaño máximo es 25MB.');
            return;
        }
        
        // Prepare for upload
        resetUI();
        progressContainer.style.display = 'block';
        resultContainer.style.display = 'block';
        resultMessage.textContent = 'Comprimiendo PDF...';
        
        // Create FormData and upload
        const formData = new FormData();
        formData.append('file', file);
        
        const xhr = new XMLHttpRequest();
        
        xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                updateProgress(percent);
            }
        };
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.success) {
                    showSuccess(response.download_url);
                } else {
                    showError(response.error || 'Error al comprimir el PDF.');
                }
            } else {
                try {
                    const response = JSON.parse(xhr.responseText);
                    showError(response.error || 'Error en el servidor.');
                } catch {
                    showError('Error al conectar con el servidor.');
                }
            }
        };
        
        xhr.onerror = function() {
            showError('Error de conexión. Por favor, intenta nuevamente.');
        };
        
        xhr.open('POST', '/comprimir', true);
        xhr.send(formData);
    }
    
    function updateProgress(percent) {
        progressBar.style.width = percent + '%';
        progressText.textContent = percent + '%';
    }
    
    function showSuccess(downloadUrl) {
        progressContainer.style.display = 'none';
        resultMessage.textContent = '¡PDF comprimido con éxito!';
        downloadBtn.href = downloadUrl;
        downloadBtn.style.display = 'inline-block';
    }
    
    function showError(message) {
        progressContainer.style.display = 'none';
        resultMessage.textContent = message;
        resultMessage.classList.add('error');
    }
    
    function resetUI() {
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
        resultMessage.textContent = '';
        resultMessage.classList.remove('error');
        downloadBtn.style.display = 'none';
    }
});