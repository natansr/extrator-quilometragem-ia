#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para extração de quilometragem de painéis de veículos usando Tesseract OCR.
Autor: Assistente de Desenvolvimento Python
"""

import pytesseract
import cv2
import numpy as np
import re
import os
from pathlib import Path


def pre_process_image(image_path):
    """
    Realiza pré-processamento da imagem para melhorar a precisão do OCR.
    
    Args:
        image_path: Caminho para a imagem
        
    Returns:
        Imagem pré-processada
    """
    # Carregar imagem
    img = cv2.imread(image_path)
    
    if img is None:
        raise ValueError(f"Não foi possível carregar a imagem: {image_path}")
    
    # Converter para escala de cinza
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Aplicar blur para reduzir ruído
    blurred = cv2.GaussianBlur(gray, (3, 3), 0)
    
    # Aplicar threshold para binarização (Otsu)
    _, thresh = cv2.threshold(
        blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )
    
    # Aplicar dilatação para conectar caracteres próximos
    kernel = np.ones((1, 1), np.uint8)
    dilated = cv2.dilate(thresh, kernel, iterations=1)
    
    return dilated, gray, img


def extract_text_from_image(image_path, lang='por'):
    """
    Extrai texto da imagem usando Tesseract OCR.
    
    Args:
        image_path: Caminho para a imagem
        lang: Idioma para o OCR (padrão: português)
        
    Returns:
        Dicionário com dados brutos do OCR
    """
    # Pré-processar imagem
    processed_img, gray, original = pre_process_image(image_path)
    
    # Configurações do Tesseract para melhor precisão em números
    custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789kmKM'
    
    # Extrair texto com diferentes configurações
    text_simple = pytesseract.image_to_string(processed_img, lang=lang, config=custom_config)
    
    # Extrair dados detalhados (posição, confiança, etc.)
    data = pytesseract.image_to_data(processed_img, lang=lang, output_type=pytesseract.Output.DICT)
    
    return {
        'text': text_simple,
        'data': data,
        'processed_image': processed_img,
        'original_image': original
    }


def find_kilometrage(text_data):
    """
    Identifica e extrai a quilometragem do texto extraído.
    
    Args:
        text_data: Dicionário com dados do OCR
        
    Returns:
        String com a quilometragem encontrada ou None
    """
    text = text_data['text']
    data = text_data['data']
    
    # Padrões para identificar quilometragem
    # Padrão 1: Número seguido de km/KM/Km
    pattern_km = r'\b(\d{1,3}(?:[.\s]?\d{3})*(?:,\d+)?)[\s]*[kK][mM]\b'
    
    # Padrão 2: Apenas números grandes (5+ dígitos) que podem ser quilometragem
    pattern_numbers = r'\b(\d{5,})\b'
    
    # Tentar encontrar padrão com "km"
    matches_km = re.findall(pattern_km, text)
    if matches_km:
        # Retornar o maior valor encontrado
        km_values = []
        for match in matches_km:
            # Remover espaços e pontos, manter apenas números
            clean_value = re.sub(r'[.\s]', '', match)
            clean_value = clean_value.replace(',', '.')
            try:
                km_values.append(float(clean_value))
            except ValueError:
                continue
        
        if km_values:
            return f"{int(max(km_values)):,}".replace(',', '.')
    
    # Se não encontrou com "km", procurar por números grandes
    matches_numbers = re.findall(pattern_numbers, text)
    if matches_numbers:
        # Filtrar números que parecem ser quilometragem (5-7 dígitos)
        valid_km = []
        for match in matches_numbers:
            if 5 <= len(match) <= 7:
                try:
                    valid_km.append(int(match))
                except ValueError:
                    continue
        
        if valid_km:
            # Retornar o maior valor (provavelmente a quilometragem total)
            return f"{max(valid_km):,}".replace(',', '.')
    
    # Alternativa: buscar nos dados detalhados do OCR
    words = data['text']
    confidences = data['conf']
    
    km_candidates = []
    for i, word in enumerate(words):
        word = word.strip()
        if word and confidences[i] > 30:  # Apenas palavras com confiança > 30%
            # Verificar se é número
            if re.match(r'^\d+$', word) and 5 <= len(word) <= 7:
                km_candidates.append(int(word))
    
    if km_candidates:
        return f"{max(km_candidates):,}".replace(',', '.')
    
    return None


def process_image(image_path, display=False):
    """
    Processa uma imagem e extrai a quilometragem.
    
    Args:
        image_path: Caminho para a imagem
        display: Se True, exibe a imagem processada (requer GUI)
        
    Returns:
        Dicionário com resultados
    """
    print(f"\n{'='*60}")
    print(f"Processando: {image_path}")
    print('='*60)
    
    try:
        # Extrair texto
        ocr_data = extract_text_from_image(image_path)
        
        print(f"\nTexto extraído (bruto):")
        print(f"  {ocr_data['text'].strip()}")
        
        # Encontrar quilometragem
        kilometrage = find_kilometrage(ocr_data)
        
        print(f"\nQuilometragem identificada: {kilometrage if kilometrage else 'Não encontrada'}")
        
        # Se display estiver habilitado, mostrar imagem
        if display:
            try:
                cv2.imshow('Imagem Processada', ocr_data['processed_image'])
                cv2.waitKey(0)
                cv2.destroyAllWindows()
            except:
                print("Nota: Não foi possível exibir a imagem (ambiente sem GUI)")
        
        return {
            'success': True,
            'image_path': image_path,
            'kilometrage': kilometrage,
            'raw_text': ocr_data['text'].strip()
        }
        
    except Exception as e:
        print(f"Erro ao processar imagem: {str(e)}")
        return {
            'success': False,
            'image_path': image_path,
            'error': str(e)
        }


def process_all_images(folder_path='.', pattern='*.jpg'):
    """
    Processa todas as imagens em uma pasta.
    
    Args:
        folder_path: Caminho da pasta com as imagens
        pattern: Padrão glob para buscar imagens
        
    Returns:
        Lista de resultados
    """
    results = []
    
    # Buscar todas as imagens
    image_files = list(Path(folder_path).glob(pattern))
    
    if not image_files:
        print(f"Nenhuma imagem encontrada com o padrão: {pattern}")
        return results
    
    print(f"\n{'#'*60}")
    print(f"# Encontradas {len(image_files)} imagem(ens) para processar")
    print('#'*60)
    
    for img_path in image_files:
        result = process_image(str(img_path))
        results.append(result)
    
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
            print(f"  {Path(r['image_path']).name}: {r['kilometrage']} km")
    
    return results


def main():
    """Função principal."""
    print("="*60)
    print("EXTRATOR DE QUILOMETRAGEM - TESSERACT OCR")
    print("="*60)
    
    # Verificar se o Tesseract está instalado
    try:
        pytesseract.get_tesseract_version()
        print("✓ Tesseract OCR detectado")
    except Exception as e:
        print(f"✗ Erro: Tesseract OCR não está instalado ou configurado")
        print(f"  Instale com: sudo apt-get install tesseract-ocr (Linux)")
        print(f"  Ou baixe em: https://github.com/tesseract-ocr/tesseract")
        return
    
    # Processar todas as imagens na raiz do projeto
    results = process_all_images(folder_path='.', pattern='camphoto_*.jpg')
    
    # Salvar resultados em arquivo
    if results:
        output_file = 'resultados_quilometragem.txt'
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("RESULTADOS DA EXTRAÇÃO DE QUILOMETRAGEM\n")
            f.write("="*60 + "\n\n")
            
            for r in results:
                f.write(f"Imagem: {r['image_path']}\n")
                if r.get('success'):
                    f.write(f"  Quilometragem: {r.get('kilometrage', 'Não encontrada')}\n")
                    f.write(f"  Texto bruto: {r.get('raw_text', 'N/A')}\n")
                else:
                    f.write(f"  Erro: {r.get('error', 'Desconhecido')}\n")
                f.write("\n")
        
        print(f"\nResultados salvos em: {output_file}")


if __name__ == '__main__':
    main()

"""
INSTALAÇÃO DOS REQUISITOS:

1. Instalar Tesseract OCR no sistema:
   Linux: sudo apt-get install tesseract-ocr tesseract-ocr-por
   Windows: Baixe em https://github.com/tesseract-ocr/tesseract
   macOS: brew install tesseract

2. Instalar pacotes Python:
   pip install pytesseract opencv-python numpy

3. (Opcional) Para exibir imagens:
   Linux: sudo apt-get install python3-tk
"""