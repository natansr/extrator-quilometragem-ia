# Extrator de Quilometragem para Viaturas

Aplicacao em Python/Flask para extrair a leitura do odometro de fotos do painel de veiculos usando Ollama com modelo de visao. O projeto tambem oferece uma interface web para registrar saida e chegada, montar um relatorio e imprimir uma "parte diaria".

Hoje o repositorio ainda carrega varios elementos do ambiente de origem do GDF, mas a base ja serve como ponto de partida para adaptar o fluxo de viaturas da UEG.

## Status do Projeto

### Fluxo da UEG: em construcao

O projeto esta em fase de adaptacao para a realidade da UEG.

Neste momento:

- a base tecnica de extracao ja existe
- o fluxo visual e o relatorio ainda refletem o modelo original recebido do GDF
- a versao final da UEG depende do PDF/formulario oficial que sera analisado depois

Assim, este repositorio deve ser entendido hoje como uma base funcional em adaptacao, e nao como a versao final do processo da UEG.

## Visao Geral

O sistema faz duas coisas principais:

1. Recebe uma ou duas imagens do painel do veiculo.
2. Envia as imagens ao Ollama para obter a quilometragem e exibe os resultados na interface.

Na interface web, o usuario pode:

- enviar imagem de saida
- enviar imagem de chegada
- informar data, hora, origem e destino
- adicionar a leitura a um relatorio local no navegador
- abrir uma pagina pronta para impressao/PDF

## Estrutura do Projeto

| Arquivo | Funcao atual |
| --- | --- |
| `app.py` | API Flask e servidor da interface web |
| `extrator_quilometragem_ollama.py` | Script Python para testes/processamento via terminal |
| `index.html` | Tela principal para upload das imagens |
| `index_relatorio.html` | Pagina de relatorio/parte diaria para impressao |
| `static/script.js` | Logica do frontend |
| `static/style.css` | Estilos da interface |
| `escolas_extraidas.json` | Lista usada no autocomplete de origem/destino |
| `docker-compose.yml` | Sobe a aplicacao, o Ollama e um init para baixar o modelo |
| `Dockerfile` | Empacotamento da aplicacao web |
| `requirements.txt` | Dependencias Python da aplicacao |
| `check_deps.py` | Script legado de verificacao de dependencias OCR antigas |

## Como o Fluxo Funciona Hoje

### Interface web

1. O usuario abre a pagina principal em `http://localhost:5000`.
2. Envia uma imagem de saida, uma de chegada ou ambas.
3. O frontend faz `POST /api/extract`.
4. O backend salva temporariamente as imagens em `uploads/`.
5. O backend envia cada imagem ao Ollama usando o endpoint `/api/generate`.
6. A resposta do modelo e tratada por regex para padronizar a quilometragem.
7. O resultado volta para a tela.
8. O usuario pode adicionar os dados ao relatorio, salvo em `localStorage`.

### Script de terminal

O arquivo `extrator_quilometragem_ollama.py` permite testar a extracao em lote nas imagens `camphoto_*.jpg` da raiz do projeto.

## Requisitos

- Python 3.10+ recomendado
- Ollama em execucao
- Modelo com capacidade de visao disponivel no Ollama
- Dependencias Python instaladas

Dependencias do projeto:

```bash
pip install -r requirements.txt
```

## Configuracao

Variaveis de ambiente aceitas pela aplicacao:

| Variavel | Padrao | Uso |
| --- | --- | --- |
| `OLLAMA_HOST` | `http://localhost` | Host do servico Ollama |
| `OLLAMA_PORT` | `11434` | Porta do Ollama |
| `OLLAMA_MODEL` | `gemma3:4b-it-q4_K_M` | Modelo de visao usado na extracao |
| `FLASK_DEBUG` | `false` | Ativa modo debug do Flask |

Exemplo:

```bash
export OLLAMA_HOST=http://localhost
export OLLAMA_PORT=11434
export OLLAMA_MODEL=gemma3:4b-it-q4_K_M
python3 app.py
```

## Como Rodar Localmente

### Opcao 1: app web

```bash
python3 app.py
```

Depois abra:

```text
http://localhost:5000
```

### Opcao 2: script de terminal

```bash
python3 extrator_quilometragem_ollama.py
```

Observacao: esse script hoje esta voltado para as imagens de exemplo `camphoto_*.jpg` presentes na raiz do repositorio.

## Como Rodar com Docker

Para subir a aplicacao e o Ollama:

```bash
docker compose up --build
```

O `docker-compose.yml` atual:

- sobe o servico `ollama`
- sobe a aplicacao Flask na porta `5000`
- executa um container auxiliar para baixar o modelo `gemma3:4b-it-q4_K_M`

## Endpoints da API

### `GET /api/health`

Verifica se a aplicacao esta no ar e se consegue falar com o Ollama.

Exemplo:

```bash
curl http://localhost:5000/api/health
```

Resposta esperada quando tudo esta ok:

```json
{
  "status": "healthy",
  "ollama": "connected"
}
```

### `POST /api/extract`

Recebe:

- `image_saida`
- `image_chegada`

Ambos sao opcionais, mas pelo menos um deve ser enviado.

Exemplo:

```bash
curl -X POST http://localhost:5000/api/extract \
  -F "image_saida=@/caminho/saida.jpg" \
  -F "image_chegada=@/caminho/chegada.jpg"
```

Exemplo de resposta:

```json
{
  "success": true,
  "saida": {
    "kilometrage": "29.462 km",
    "raw_response": "29462 km",
    "date": null,
    "time": null,
    "filename": "saida.jpg"
  },
  "chegada": {
    "kilometrage": "29.477 km",
    "raw_response": "29477 km",
    "date": null,
    "time": null,
    "filename": "chegada.jpg"
  },
  "errors": []
}
```

### `GET /api/schools`

Retorna a lista do arquivo `escolas_extraidas.json` para autocomplete no frontend.

## O Que Ja Esta Pronto

- extracao de quilometragem via IA local com Ollama
- upload de uma ou duas imagens
- processamento separado de saida e chegada
- padronizacao da quilometragem retornada pelo modelo
- tela web para uso operacional
- preenchimento complementar de data, hora, origem e destino
- geracao de relatorio em pagina separada para impressao
- persistencia local do relatorio no navegador

## Pontos de Atencao Para Adaptacao na UEG

O codigo ainda reflete o contexto de origem. Antes de colocar em uso real na UEG, vale revisar:

- identidade visual e textos ainda ligados ao GDF
- arquivo `brasao_gdf.png` e cabecalho do relatorio
- nomenclaturas de escolas e destinos no autocomplete
- layout da "parte diaria", que hoje segue o modelo do GDF
- campos obrigatorios que a UEG usa no controle de viaturas
- formato exato do PDF ou formulario oficial da UEG

## Proxima Etapa Para Adaptacao

Status: em construcao

Quando voce trouxer o modelo de PDF ou formulario da UEG, a adaptacao deve seguir esta ordem:

1. mapear os campos obrigatorios do documento real
2. decidir quais campos saem automaticamente da IA e quais serao digitados
3. ajustar `index_relatorio.html` para o layout institucional da UEG
4. trocar brasao, textos e rotulos
5. validar com algumas fotos reais de painel das viaturas
6. revisar se a formatacao de data, hora e kilometragem bate com o padrao interno

## Limitacoes Atuais

- a extracao depende da qualidade da foto do painel
- o parser de quilometragem usa regex simples; leituras ruins podem falhar
- nao ha banco de dados
- nao ha autenticacao
- o relatorio e salvo apenas no navegador do usuario
- o script `check_deps.py` parece ser de uma abordagem antiga com OCR/Tesseract e nao representa o fluxo principal atual

## Orientacao Pratica Para Voce Agora

Enquanto voce ainda vai levantar o modelo de PDF da UEG, o melhor caminho e:

1. rodar o sistema com fotos de teste
2. verificar se ele consegue ler bem os odometros das viaturas que voces usam
3. separar 2 ou 3 exemplos reais de formularios ou PDFs da UEG
4. marcar quais campos precisam aparecer no relatorio final

Com isso, a gente consegue fazer a migracao do modelo do GDF para a UEG com bem menos retrabalho.
