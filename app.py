from flask import Flask, request, jsonify, send_file, make_response
from flask_cors import CORS
import os
import subprocess
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)  # Esto habilita CORS en todas las rutas

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/tmp/compress', methods=['POST', 'OPTIONS'])
def compress_pdf():
    if request.method == 'OPTIONS':
        # Respuesta a la preflight request
        response = app.make_default_options_response()
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response

    if 'pdf' not in request.files:
        return jsonify({'error': 'No PDF file uploaded'}), 400

    pdf = request.files['pdf']
    filename = secure_filename(pdf.filename)
    input_path = os.path.join('/tmp/uploads', filename)
    output_path = os.path.join('/tmp/compress', filename)

    os.makedirs('/tmp/uploads', exist_ok=True)
    os.makedirs('/tmp/compress', exist_ok=True)
    pdf.save(input_path)

    command = [
        'gs',
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.4',
        '-dPDFSETTINGS=/ebook',
        '-dNOPAUSE',
        '-dQUIET',
        '-dBATCH',
        f'-sOutputFile={output_path}',
        input_path
    ]

    try:
        subprocess.run(command, check=True)
    except subprocess.CalledProcessError as e:
        return jsonify({'error': 'Ghostscript compression failed'}), 500

    return send_file(output_path, as_attachment=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4040, debug=True)
