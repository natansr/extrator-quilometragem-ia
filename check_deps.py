#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para verificar dependências do Extrator de Quilometragem.
"""

import sys
import subprocess


def check_python_version():
    """Verifica versão do Python."""
    version = sys.version_info
    print(f"\n{'='*60}")
    print("VERIFICAÇÃO DE DEPENDÊNCIAS")
    print('='*60)
    print(f"\n✓ Python: {version.major}.{version.minor}.{version.micro}")
    return version.major >= 3 and version.minor >= 7


def check_package(package_name, import_name=None):
    """Verifica se um pacote está instalado."""
    if import_name is None:
        import_name = package_name
    
    try:
        __import__(import_name)
        print(f"✓ {package_name}: Instalado")
        return True
    except ImportError:
        print(f"✗ {package_name}: NÃO INSTALADO")
        return False


def check_tesseract():
    """Verifica se o Tesseract OCR está instalado."""
    try:
        import pytesseract
        version = pytesseract.get_tesseract_version()
        print(f"✓ Tesseract OCR: Instalado (versão {version})")
        return True
    except Exception as e:
        print(f"✗ Tesseract OCR: NÃO INSTALADO")
        print(f"  Erro: {str(e)}")
        print(f"\n  Para instalar:")
        print(f"    Linux: sudo apt-get install tesseract-ocr tesseract-ocr-por")
        print(f"    macOS: brew install tesseract")
        print(f"    Windows: https://github.com/UB-Mannheim/tesseract/wiki")
        return False


def check_opencv():
    """Verifica OpenCV."""
    try:
        import cv2
        print(f"✓ OpenCV: Instalado (versão {cv2.__version__})")
        return True
    except ImportError:
        print(f"✗ OpenCV: NÃO INSTALADO")
        return False


def check_numpy():
    """Verifica NumPy."""
    try:
        import numpy as np
        print(f"✓ NumPy: Instalado (versão {np.__version__})")
        return True
    except ImportError:
        print(f"✗ NumPy: NÃO INSTALADO")
        return False


def check_pytesseract():
    """Verifica pytesseract."""
    try:
        import pytesseract
        print(f"✓ pytesseract: Instalado")
        return True
    except ImportError:
        print(f"✗ pytesseract: NÃO INSTALADO")
        return False


def main():
    """Função principal de verificação."""
    python_ok = check_python_version()
    
    print("\n--- Pacotes Python ---")
    opencv_ok = check_opencv()
    numpy_ok = check_numpy()
    pytesseract_ok = check_pytesseract()
    
    print("\n--- Tesseract OCR (Sistema) ---")
    tesseract_ok = check_tesseract()
    
    print(f"\n{'='*60}")
    print("RESUMO")
    print('='*60)
    
    all_ok = all([opencv_ok, numpy_ok, pytesseract_ok, tesseract_ok])
    
    if all_ok:
        print("\n✓ Todas as dependências estão instaladas!")
        print("\nVocê pode executar o script com:")
        print("  python extrator_quilometragem.py")
    else:
        print("\n✗ Algumas dependências estão faltando.")
        print("\nPara instalar todas as dependências Python:")
        print("  pip install -r requirements.txt")
        
        if not tesseract_ok:
            print("\nPara instalar o Tesseract OCR (requer sudo):")
            print("  sudo apt-get install tesseract-ocr tesseract-ocr-por")
    
    print(f"\n{'='*60}\n")
    
    return all_ok


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
