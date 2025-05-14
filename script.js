document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const dropArea = document.getElementById('dropArea');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const resultContainer = document.getElementById('resultContainer');
    const downloadLink = document.getElementById('downloadLink');
    
    // Manejar selección de archivo
    fileInput.addEventListener('change', handleFiles);
    
    // Manejar drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('drag-over');
    }
    
    function unhighlight() {
        dropArea.classList.remove('drag-over');
    }
    
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        fileInput.files = files;
        handleFiles({ target: fileInput });
    }
    
    async function handleFiles(e) {
        const file = e.target.files[0];
        if (!file || file.type !== 'application/pdf') {
            alert('Por favor selecciona un archivo PDF válido');
            return;
        }
        
        // Mostrar progreso
        progressContainer.style.display = 'block';
        resultContainer.style.display = 'none';
        updateProgress(0, 'Preparando archivo...');
        
        try {
            // Subir archivo a Lambda para comprimir
            const compressedPdfUrl = await uploadAndCompress(file);
            
            // Mostrar resultado
            downloadLink.href = compressedPdfUrl;
            downloadLink.download = file.name.replace('.pdf', '_copia.pdf');
            resultContainer.style.display = 'block';
            progressContainer.style.display = 'none';



            // Agregar evento para resetear después de descargar
            downloadLink.addEventListener('click', function afterDownload() {
                setTimeout(() => {
                    resultContainer.style.display = 'none';
                    // Limpiar el objeto URL si es local
                    if (compressedPdfUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(compressedPdfUrl);
                    }
                    // Resetear el input file
                    fileInput.value = '';
                }, 1000);
            }, {once: true}); // El listener se autoeliminará después de ejecutarse



            
        } catch (error) {
            console.error('Error:', error);
            alert('Error al comprimir el PDF: ' + error.message);
            progressContainer.style.display = 'none';
        }
    }
    
    function updateProgress(percent, message) {
        progressBar.style.width = `${percent}%`;
        progressText.textContent = message || `${percent}%`;
    }
    
    async function uploadAndCompress(file) {
        return new Promise((resolve, reject) => {
            // Aquí implementarías la llamada a tu API Gateway/Lambda
            // Esto es un ejemplo simulando una subida
            
            // Simular progreso
            let progress = 0;
            const interval = setInterval(() => {
                progress += 5;
                updateProgress(progress, `Comprimiendo PDF... ${progress}%`);
                
                if (progress >= 100) {
                    clearInterval(interval);
                    // En una implementación real, aquí obtendrías la URL del S3
                    // resolve(responseData.compressedUrl);
                    
                    // Simulación: crear un blob local para demostración
                    setTimeout(() => {
                        const blob = new Blob([file], { type: 'application/pdf' });
                        const url = URL.createObjectURL(blob);
                        resolve(url);
                    }, 500);
                }
            }, 200);
        });
    }
});

