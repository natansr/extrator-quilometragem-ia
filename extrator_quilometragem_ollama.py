#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para extração de quilometragem de painéis de veículos usando Ollama + Gemma3.
Modelo: gemma3:4b-it-q4_K_M (com capacidade de visão)
"""

import base64
import json
import requests
import re
from pathlib import Path
from typing import Optional, Dict, List


class OllamaKilometrageExtractor:
    """
    Classe para extração de quilometragem usando Ollama com modelo de visão.
    """
    
    def __init__(self, 
                 ollama_host: str = 'http://localhost',
                 ollama_port: int = 11434,
                 model: str = 'gemma3:4b-it-q4_K_M'):
        """
        Inicializa o extrator.
        
        Args:
            ollama_host: Host do Ollama (padrão: localhost)
            ollama_port: Porta do Ollama (padrão: 11434)
            model: Nome do modelo a ser usado (padrão: gemma3:4b-it-q4_K_M)
        """
        self.base_url = f"{ollama_host}:{ollama_port}"
        self.model = model
        self.api_endpoint = f"{self.base_url}/api/generate"
        
    def _encode_image(self, image_path: str) -> str:
        """
        Codifica uma imagem em base64.
        
        Args:
            image_path: Caminho para a imagem
            
        Returns:
            String base64 da imagem
        """
        with open(image_path, 'rb') as img_file:
            return base64.b64encode(img_file.read()).decode('utf-8')
    
    def _build_prompt(self) -> str:
        """
        Constrói o prompt para o modelo.
        
        Returns:
            Prompt formatado
        """
        return """Esta imagem se trata de um painel de um veículo, nosso foco é ler o valor em quilometragem que o odometro está exibindo, normalmente a quilometragem é dada em multiplos de mil, e antes da quilometragem terá escrito ODO A resposta deverá ser: xxxxxxx km"""
    
    def extract_from_image(self, image_path: str) -> Dict:
        """
        Extrai a quilometragem de uma imagem usando o modelo de visão.
        
        Args:
            image_path: Caminho para a imagem
            
        Returns:
            Dicionário com resultados da extração
        """
        result = {
            'success': False,
            'image_path': image_path,
            'kilometrage': None,
            'raw_response': None,
            'error': None
        }
        
        try:
            # Codificar imagem
            image_base64 = self._encode_image(image_path)
            
            # Construir payload para API do Ollama
            payload = {
                'model': self.model,
                'prompt': self._build_prompt(),
                'images': [image_base64],
                'stream': False,
                'options': {
                    'temperature': 0.1,  # Baixa temperatura para respostas mais consistentes
                    'top_p': 0.9
                }
            }
            
            # Fazer requisição para API
            response = requests.post(
                self.api_endpoint,
                json=payload,
                timeout=120  # Timeout de 120 segundos para processamento da imagem
            )
            
            if response.status_code == 200:
                response_data = response.json()
                raw_text = response_data.get('response', '')
                
                result['raw_response'] = raw_text
                result['success'] = True
                
                # Extrair quilometragem da resposta
                kilometrage = self._parse_kilometrage(raw_text)
                result['kilometrage'] = kilometrage
                
            else:
                result['error'] = f"Erro HTTP {response.status_code}: {response.text}"
                
        except requests.exceptions.ConnectionError:
            result['error'] = "Não foi possível conectar ao Ollama. Verifique se o container está rodando na porta 11434."
        except requests.exceptions.Timeout:
            result['error'] = "Timeout na requisição. O processamento da imagem demorou mais que o esperado."
        except FileNotFoundError:
            result['error'] = f"Imagem não encontrada: {image_path}"
        except Exception as e:
            result['error'] = f"Erro inesperado: {str(e)}"
        
        return result
    
    def _parse_kilometrage(self, text: str) -> Optional[str]:
        """
        Extrai a quilometragem do texto retornado pelo modelo.
        
        Args:
            text: Texto retornado pelo modelo
            
        Returns:
            String com quilometragem formatada ou None
        """


        # Limpar o texto para facilitar parsing
        text_clean = text.strip()
        

        # Padrão 1: Número seguido de km (captura número completo)
        pattern = r'(\d{1,3}(?:[.\s]?\d{3})*(?:,\d+)?(?:\.\d+)?)\s*[kK][mM]'
        
        matches = re.findall(pattern, text_clean, re.IGNORECASE)
        
        if matches:
            # Pegar o último/maior valor encontrado (provavelmente a quilometragem)
            km_value = matches[-1]



            # Remover espaços e manter apenas números e pontos/vírgulas
            km_clean = re.sub(r'\s', '', km_value)
            # Remover vírgulas e pontos decimais, manter apenas dígitos
            km_digits = re.sub(r'[,.]', '', km_clean)
            
            try:

                km_int = int(km_digits)
                # Formatar com separador de milhar
                return f"{km_int:,}".replace(',', '.') + ' km'
            except ValueError:
                pass
        

        # Padrão 2: Apenas números no formato com ponto (ex: 294.19)
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
        
        # Padrão 3: Apenas números grandes (5-7 dígitos)
        pattern_numbers = r'\b(\d{5,7})\b'

        matches_numbers = re.findall(pattern_numbers, text_clean)
        
        if matches_numbers:
            try:
                km_int = int(matches_numbers[-1])
                return f"{km_int:,}".replace(',', '.') + ' km'
            except ValueError:
                pass
        
        # Retornar None se não encontrou
        return None
    
    def check_connection(self) -> bool:
        """
        Verifica se consegue conectar ao Ollama.
        
        Returns:
            True se conectado, False caso contrário
        """
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                print(f"✓ Conectado ao Ollama em {self.base_url}")
                
                # Verificar se o modelo está disponível
                models = response.json().get('models', [])
                model_names = [m.get('name', '') for m in models]
                
                if any(self.model in m for m in model_names):
                    print(f"✓ Modelo '{self.model}' disponível")
                    return True
                else:
                    print(f"⚠ Modelo '{self.model}' não encontrado na lista de modelos")
                    print(f"  Modelos disponíveis: {', '.join(model_names[:5])}...")
                    return True  # Ainda pode funcionar
            else:
                print(f"✗ Erro ao conectar: HTTP {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            print(f"✗ Não foi possível conectar ao Ollama em {self.base_url}")
            print(f"  Verifique se o container está rodando:")
            print(f"    docker ps | grep ollama")
            return False
        except Exception as e:
            print(f"✗ Erro: {str(e)}")
            return False


def process_all_images_ollama(folder_path: str = '.', 
                               pattern: str = 'camphoto_*.jpg',
                               ollama_host: str = 'http://localhost',
                               ollama_port: int = 11434,
                               model: str = 'gemma3:4b-it-q4_K_M') -> List[Dict]:
    """
    Processa todas as imagens em uma pasta usando Ollama.
    
    Args:
        folder_path: Caminho da pasta com as imagens
        pattern: Padrão glob para buscar imagens
        ollama_host: Host do Ollama
        ollama_port: Porta do Ollama
        model: Modelo a ser usado
        
    Returns:
        Lista de resultados
    """
    # Criar extrator
    extractor = OllamaKilometrageExtractor(
        ollama_host=ollama_host,
        ollama_port=ollama_port,
        model=model
    )
    
    # Verificar conexão
    print(f"\n{'='*60}")
    print("VERIFICANDO CONEXÃO COM OLLAMA")
    print('='*60)
    
    if not extractor.check_connection():
        print("\n✗ Não foi possível conectar ao Ollama. Encerrando.")
        return []
    
    # Buscar imagens
    image_files = list(Path(folder_path).glob(pattern))
    
    if not image_files:
        print(f"\nNenhuma imagem encontrada com o padrão: {pattern}")
        return []
    
    print(f"\n{'#'*60}")
    print(f"# Encontradas {len(image_files)} imagem(ens) para processar")
    print('#'*60)
    
    results = []
    
    for i, img_path in enumerate(image_files, 1):
        print(f"\n[{i}/{len(image_files)}] Processando: {img_path.name}")
        print('-'*60)
        
        result = extractor.extract_from_image(str(img_path))
        results.append(result)
        
        if result['success']:
            print(f"  ✓ Sucesso")
            print(f"  Quilometragem: {result['kilometrage'] or 'Não identificada'}")
            if result['raw_response']:
                # Mostrar apenas primeiras 100 letras da resposta
                preview = result['raw_response'][:100].replace('\n', ' ')
                print(f"  Resposta: {preview}..." if len(result['raw_response']) > 100 else f"  Resposta: {preview}")
        else:
            print(f"  ✗ Erro: {result['error']}")
    
    # Resumo final
    print(f"\n{'='*60}")
    print("RESUMO FINAL")
    print('='*60)
    
    successful = [r for r in results if r.get('success')]
    with_km = [r for r in successful if r.get('kilometrage')]
    
    print(f"Total de imagens: {len(results)}")
    print(f"Processadas com sucesso: {len(successful)}")
    print(f"Quilometragem encontrada: {len(with_km)}")
    
    if with_km:
        print(f"\nResultados:")
        for r in with_km:
            print(f"  {Path(r['image_path']).name}: {r['kilometrage']}")
    
    return results


def save_results(results: List[Dict], output_file: str = 'resultados_ollama.txt'):
    """
    Salva os resultados em um arquivo.
    
    Args:
        results: Lista de resultados
        output_file: Nome do arquivo de saída
    """
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("RESULTADOS DA EXTRAÇÃO DE QUILOMETRAGEM - OLLAMA + GEMMA3\n")
        f.write("="*60 + "\n\n")
        
        for r in results:
            f.write(f"Imagem: {r['image_path']}\n")
            if r.get('success'):
                f.write(f"  Quilometragem: {r.get('kilometrage', 'Não encontrada')}\n")
                f.write(f"  Resposta completa:\n")
                f.write(f"    {r.get('raw_response', 'N/A')}\n")
            else:
                f.write(f"  Erro: {r.get('error', 'Desconhecido')}\n")
            f.write("\n")
    
    print(f"\nResultados salvos em: {output_file}")


def main():
    """Função principal."""
    print("="*60)
    print("EXTRATOR DE QUILOMETRAGEM - OLLAMA + GEMMA3")
    print("Modelo: gemma3:4b-it-q4_K_M (Visão)")
    print("="*60)
    
    # Processar todas as imagens na raiz do projeto
    results = process_all_images_ollama(
        folder_path='.',
        pattern='camphoto_*.jpg',
        ollama_host='http://localhost',
        ollama_port=11434,
        model='gemma3:4b-it-q4_K_M'
    )
    
    # Salvar resultados
    if results:
        save_results(results)


if __name__ == '__main__':
    main()
