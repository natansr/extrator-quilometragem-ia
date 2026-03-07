#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
API Flask para o Extrator de Quilometragem com Ollama.
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import base64
import requests
import re
import os
from pathlib import Path
from typing import Optional, Dict
import uuid
import exifread
from datetime import datetime

app = Flask(__name__, static_folder='static')
CORS(app)

# Configurações
OLLAMA_HOST = os.getenv('OLLAMA_HOST', 'http://localhost')
OLLAMA_PORT = os.getenv('OLLAMA_PORT', '11434')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'gemma3:4b-it-q4_K_M')
UPLOAD_FOLDER = 'uploads'

# Criar pasta de uploads se não existir
Path(UPLOAD_FOLDER).mkdir(exist_ok=True)


class KilometrageExtractor:
    """Extrator de quilometragem usando Ollama."""
    
    def __init__(self):
        self.base_url = f"{OLLAMA_HOST}:{OLLAMA_PORT}"
        self.model = OLLAMA_MODEL
        self.api_endpoint = f"{self.base_url}/api/generate"
    
    def _encode_image(self, image_path: str) -> str:
        with open(image_path, 'rb') as img_file:
            return base64.b64encode(img_file.read()).decode('utf-8')
    
    def _build_prompt(self) -> str:
        return """Esta imagem se trata de um painel de um veículo, nosso foco é ler o valor em quilometragem que o odometro está exibindo, normalmente a quilometragem é dada em multiplos de mil, antes da KM pode estar escrito ODO. A resposta deverá ser: xxxxxxx km"""
    
    def _parse_kilometrage(self, text: str) -> Optional[str]:
        text_clean = text.strip()
        
        pattern = r'(\d{1,3}(?:[.\s]?\d{3})*(?:,\d+)?(?:\.\d+)?)\s*[kK][mM]'
        matches = re.findall(pattern, text_clean, re.IGNORECASE)
        
        if matches:
            km_value = matches[-1]
            km_clean = re.sub(r'\s', '', km_value)
            km_digits = re.sub(r'[,.]', '', km_clean)
            try:
                km_int = int(km_digits)
                return f"{km_int:,}".replace(',', '.') + ' km'
            except ValueError:
                pass
        
        pattern_dotted = r'(\d{1,3}(?:\.\d{3})+)\s*[kK][mM]'
        matches_dotted = re.findall(pattern_dotted, text_clean)
        
        if matches_dotted:
            km_value = matches_dotted[-1]
            km_digits = km_value.replace('.', '')
            try:
                km_int = int(km_digits)
                return f"{km_int:,}".replace(',', '.') + ' km'
            except ValueError:
                pass
        
        pattern_numbers = r'\b(\d{5,7})\b'
        matches_numbers = re.findall(pattern_numbers, text_clean)
        
        if matches_numbers:
            try:
                km_int = int(matches_numbers[-1])
                return f"{km_int:,}".replace(',', '.') + ' km'
            except ValueError:
                pass
        
        return None
    
    def extract(self, image_path: str) -> Dict:
        result = {
            'success': False,
            'kilometrage': None,
            'raw_response': None,
            'error': None
        }
        
        try:
            image_base64 = self._encode_image(image_path)
            
            payload = {
                'model': self.model,
                'prompt': self._build_prompt(),
                'images': [image_base64],
                'stream': False,
                'options': {
                    'temperature': 0.1,
                    'top_p': 0.9
                }
            }
            
            response = requests.post(
                self.api_endpoint,
                json=payload,
                timeout=120
            )
            
            if response.status_code == 200:
                response_data = response.json()
                raw_text = response_data.get('response', '')
                
                result['raw_response'] = raw_text
                result['success'] = True
                result['kilometrage'] = self._parse_kilometrage(raw_text)
            else:
                result['error'] = f"Erro HTTP {response.status_code}"
                
        except requests.exceptions.ConnectionError:
            result['error'] = "Não foi possível conectar ao Ollama"
        except requests.exceptions.Timeout:
            result['error'] = "Timeout na requisição"
        except Exception as e:
            result['error'] = f"Erro: {str(e)}"
        
        return result


extractor = KilometrageExtractor()


def extract_exif_metadata(image_path: str) -> Dict:
    """Extrai metadata EXIF de uma imagem (data, hora)."""
    metadata = {
        'date': None,
        'time': None,
        'datetime': None
    }
    
    try:
        with open(image_path, 'rb') as img_file:
            tags = exifread.process_file(img_file, details=False)
            
            # Tentar obter data/hora da foto
            if 'EXIF DateTimeOriginal' in tags:
                datetime_str = str(tags['EXIF DateTimeOriginal'])
                # Formato: YYYY:MM:DD HH:MM:SS
                parts = datetime_str.split(' ')
                if len(parts) == 2:
                    date_parts = parts[0].split(':')
                    time_parts = parts[1].split(':')
                    
                    if len(date_parts) == 3:
                        metadata['date'] = f"{date_parts[2]}/{date_parts[1]}/{date_parts[0][-2:]}"
                    
                    if len(time_parts) >= 2:
                        metadata['time'] = f"{time_parts[0]}h{time_parts[1]}"
                    
                    metadata['datetime'] = datetime_str
                    
            # Se não encontrou EXIF, usar data do arquivo
            if not metadata['date']:
                file_time = datetime.fromtimestamp(os.path.getctime(image_path))
                metadata['date'] = file_time.strftime('%d/%m/%y')
                metadata['time'] = file_time.strftime('%Hh%M')
                
    except Exception as e:
        print(f"Erro ao extrair EXIF: {e}")
        # Usar data atual como fallback
        now = datetime.now()
        metadata['date'] = now.strftime('%d/%m/%y')
        metadata['time'] = now.strftime('%Hh%M')
    
    return metadata


@app.route('/')
def index():
    """Serve a página principal."""
    return send_from_directory('.', 'index.html')

@app.route('/relatorio')
def relatorio():
    """Serve a página de relatório/impressão."""
    return send_from_directory('.', 'index_relatorio.html')


@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve arquivos estáticos."""
    return send_from_directory('static', filename)


@app.route('/api/extract', methods=['POST'])
def extract_kilometrage():
    """Extrai quilometragem de uma ou mais imagens (saída e chegada)."""
    # Suportar múltiplas imagens: image_saida e image_chegada
    image_saida = request.files.get('image_saida')
    image_chegada = request.files.get('image_chegada')
    
    if not image_saida and not image_chegada:
        return jsonify({
            'success': False,
            'error': 'Nenhuma imagem enviada'
        }), 400
    
    result = {
        'success': True,
        'saida': None,
        'chegada': None,
        'errors': []
    }
    
    # Processar imagem de saída
    if image_saida and image_saida.filename != '':
        try:
            file_ext = Path(image_saida.filename).suffix.lower()
            if file_ext not in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
                result['errors'].append('Formato de arquivo de saída não suportado')
            else:
                unique_filename = f"{uuid.uuid4().hex}_saida{file_ext}"
                file_path = Path(UPLOAD_FOLDER) / unique_filename
                image_saida.save(str(file_path))
                
                # Extrair quilometragem
                km_result = extractor.extract(str(file_path))
                
                # Extrair metadata EXIF
                exif_data = extract_exif_metadata(str(file_path))
                
                if km_result['success']:
                    result['saida'] = {
                        'kilometrage': km_result['kilometrage'],
                        'raw_response': km_result['raw_response'],
                        'date': exif_data['date'],
                        'time': exif_data['time'],
                        'filename': image_saida.filename
                    }
                else:
                    result['errors'].append(f"Erro na saída: {km_result['error']}")
                
                file_path.unlink(missing_ok=True)
        except Exception as e:
            result['errors'].append(f'Erro ao processar saída: {str(e)}')
    
    # Processar imagem de chegada
    if image_chegada and image_chegada.filename != '':
        try:
            file_ext = Path(image_chegada.filename).suffix.lower()
            if file_ext not in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
                result['errors'].append('Formato de arquivo de chegada não suportado')
            else:
                unique_filename = f"{uuid.uuid4().hex}_chegada{file_ext}"
                file_path = Path(UPLOAD_FOLDER) / unique_filename
                image_chegada.save(str(file_path))
                
                # Extrair quilometragem
                km_result = extractor.extract(str(file_path))
                
                # Extrair metadata EXIF
                exif_data = extract_exif_metadata(str(file_path))
                
                if km_result['success']:
                    result['chegada'] = {
                        'kilometrage': km_result['kilometrage'],
                        'raw_response': km_result['raw_response'],
                        'date': exif_data['date'],
                        'time': exif_data['time'],
                        'filename': image_chegada.filename
                    }
                else:
                    result['errors'].append(f"Erro na chegada: {km_result['error']}")
                
                file_path.unlink(missing_ok=True)
        except Exception as e:
            result['errors'].append(f'Erro ao processar chegada: {str(e)}')
    
    if result['errors']:
        result['success'] = False
        result['error_message'] = '; '.join(result['errors'])
    
    return jsonify(result)


@app.route('/api/health')
def health_check():
    """Verifica saúde da API e conexão com Ollama."""
    try:
        response = requests.get(f"{OLLAMA_HOST}:{OLLAMA_PORT}/api/tags", timeout=5)
        if response.status_code == 200:
            return jsonify({
                'status': 'healthy',
                'ollama': 'connected',
                'model': OLLAMA_MODEL
            })
        else:
            return jsonify({
                'status': 'degraded',
                'ollama': 'error',
                'message': 'Erro na conexão com Ollama'
            }), 503
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'ollama': 'disconnected',
            'error': str(e)
        }), 503


if __name__ == '__main__':
    print("="*60)
    print("API Extrator de Quilometragem")
    print("="*60)
    print(f"Ollama Host: {OLLAMA_HOST}:{OLLAMA_PORT}")
    print(f"Modelo: {OLLAMA_MODEL}")
    print("="*60)
    app.run(host='0.0.0.0', port=5000, debug=True)
