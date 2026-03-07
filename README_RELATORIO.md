# Relatório de Parte Diária - Extrator de Quilometragem

## 📋 Funcionalidade de Relatório

O sistema agora inclui uma funcionalidade completa de geração de relatório no formato **Parte Diária** do GDF, que pode ser impresso ou salvo como PDF.

## 🚀 Como Usar

### 1. Extrair Quilometragem

1. Acesse a página principal: `http://localhost:5000`
2. Faça upload de uma imagem do painel do veículo
3. Clique em "Extrair Quilometragem"
4. Aguarde o processamento da IA

### 2. Adicionar ao Relatório

Após extrair a quilometragem:

1. Clique em **"Adicionar ao Relatório"** (botão azul)
2. Uma nova aba será aberta com o relatório
3. A leitura será automaticamente adicionada à tabela

### 3. Acessar Relatório Diretamente

Você também pode acessar o relatório diretamente:

```
http://localhost:5000/relatorio
```

### 4. Preencher Dados do Relatório

No relatório, preencha os campos editáveis:

- **Nome do Motorista**
- **Matrícula**
- **Lotação**
- **Marca/Modelo do Veículo**
- **Placa**
- **Data**

### 5. Adicionar Itinerários

#### Automaticamente (via extração):
- Use a página principal para extrair de imagens
- Clique em "Adicionar ao Relatório"

#### Manualmente:
- No painel do relatório, use o formulário "Adicionar Novo Itinerário"
- Preencha: Data, Hora Saída, Odômetro, Hora Chegada, KM, Origem/Destino
- Clique em "Adicionar Linha"

### 6. Imprimir / Salvar PDF

1. Clique em **"🖨️ Imprimir / Salvar PDF"**
2. Na janela de impressão, selecione "Salvar como PDF"
3. Ou imprima diretamente em papel

### 7. Baixar HTML

- Clique em **"💾 Baixar HTML"** para salvar uma cópia editável
- O arquivo pode ser aberto posteriormente em qualquer navegador

## 📊 Campos da Tabela

| Coluna | Descrição | Editável |
|--------|-----------|----------|
| DATA | Data do itinerário | ✅ Sim |
| HORA (Saída) | Hora de saída | ✅ Sim |
| ODÔMETRO (Saída) | KM inicial | ✅ Sim |
| HORA (Chegada) | Hora de chegada | ✅ Sim |
| KM (Chegada) | KM final | ✅ Sim |
| Origem/Destino | Local de origem e destino | ✅ Sim |

## 🎯 Fluxo de Trabalho Sugerido

```
1. Extrair KM de todas as imagens do dia
   ↓
2. Cada extração → Adicionar ao Relatório
   ↓
3. Acessar Relatório (aba separada)
   ↓
4. Preencher dados do motorista e veículo
   ↓
5. Revisar itinerários na tabela
   ↓
6. Ajustar campos se necessário
   ↓
7. Imprimir ou Salvar PDF
```

## 💾 Armazenamento

- Os dados são salvos no **sessionStorage** do navegador
- Persistem enquanto a aba estiver aberta
- Use "Baixar HTML" para保存 permanente

## 🔧 Recursos do Relatório

### Controles:
- 🖨️ **Imprimir / Salvar PDF** - Gera PDF para impressão
- 💾 **Baixar HTML** - Salva cópia editável
- 🗑️ **Limpar Tudo** - Remove todos os itinerários

### Formulário de Adição:
- ➕ **Adicionar Novo Itinerário** - Campos para entrada manual

### Campos Editáveis:
- Todos os campos do formulário são editáveis
- Todas as células da tabela são editáveis
- Alterações são salvas automaticamente

## 📄 Formato de Impressão

O relatório segue o padrão A4 (210mm x 297mm):

- Cabeçalho oficial GDF
- Tabela formatada para preenchimento
- Rodapé com campos de assinatura
- Otimizado para impressão em preto e branco

## 🌐 URLs do Sistema

| Página | URL |
|--------|-----|
| Principal | `http://localhost:5000` |
| Relatório | `http://localhost:5000/relatorio` |
| Health Check | `http://localhost:5000/api/health` |
| Extrair API | `http://localhost:5000/api/extract` |

## 📝 Exemplo de Dados

```
Nome: JOÃO DA SILVA
Matrícula: 123.456-7
Lotação: SEDF/ESCOLA ABC
Veículo: CHEVROLET/ONIX
Placa: SSI-7C34

Itinerários:
| DATA     | SAÍDA  | ODÔMETRO | CHEGADA | KM     | ORIGEM/DESTINO          |
|----------|--------|----------|---------|--------|-------------------------|
| 07/03/26 | 08h00  | 29419    | 09h00   | 29462  | Garagem -> Escola ABC   |
| 07/03/26 | 12h00  | 29462    | 13h00   | 29477  | Escola ABC -> Restaurante|
```

## 🔐 Privacidade

- Dados armazenados apenas no navegador
- Nenhuma informação é enviada ao servidor
- Relatórios são gerados localmente

## 📱 Responsividade

- Página principal: Responsiva (mobile-friendly)
- Relatório: Formato A4 fixo para impressão

## ⚠️ Notas Importantes

1. **SessionStorage**: Os dados são perdidos ao fechar a aba
2. **Backup**: Use "Baixar HTML" para保存 importante
3. **Impressão**: Verifique preview antes de imprimir
4. **Edição**: Todos os campos são editáveis antes da impressão

## 🎨 Dicas de Uso

- ✅ Revise todos os dados antes de imprimir
- ✅ Use campos editáveis para corrigir extrações
- ✅ Adicione observações no campo "outras"
- ✅ Salve HTML como backup antes de fechar
- ✅ Imprima em papel A4 para formato oficial

## 📞 Suporte

Em caso de dúvidas ou problemas:
1. Verifique se Ollama está rodando
2. Confira console do navegador (F12)
3. Teste health check da API

---

**Versão:** 1.0  
**Última Atualização:** Março 2026
