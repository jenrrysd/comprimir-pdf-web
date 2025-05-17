import os
import subprocess
import tempfile
import boto3
from urllib.parse import unquote_plus
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)


s3 = boto3.client('s3')

def lambda_handler(event, context):
    # Obtener información del archivo subido
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = unquote_plus(event['Records'][0]['s3']['object']['key'])
    
    # Crear directorios temporales
    with tempfile.TemporaryDirectory() as tmpdir:
        input_pdf = os.path.join(tmpdir, 'input.pdf')
        output_pdf = os.path.join(tmpdir, 'output.pdf')
        
        # Descargar PDF desde S3
        s3.download_file(bucket, key, input_pdf)
        
        # Comprimir PDF con Ghostscript
        try:
            subprocess.run([
                'gs',
                '-sDEVICE=pdfwrite',
                '-dPDFSETTINGS=/ebook',
                '-dNOPAUSE',
                '-dQUIET',
                '-dBATCH',
                f'-sOutputFile={output_pdf}',
                input_pdf
            ], check=True)
            
            # Subir PDF comprimido de vuelta a S3
            output_key = f"uploads/{os.path.splitext(key)[0]}_copia.pdf"
            s3.upload_file(output_pdf, bucket, output_key)
            
            # Generar URL firmada para descarga
            url = s3.generate_presigned_url(
                'get_object',
                Params={'Bucket': bucket, 'Key': output_key},
                ExpiresIn=3600
            )
            
            return {
                'statusCode': 200,
                'body': url
            }
            
        except subprocess.CalledProcessError as e:
            return {
                'statusCode': 500,
                'body': 'Error al comprimir el PDF'
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'body': str(e)
            }


