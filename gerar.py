import csv
import json

# Dados fornecidos
data_json = {
  "data": [
    {
      "id": 803200,
      "borrower": "ZASB APOIO ADMINISTRATIVO E REPRESENTACOES LTDA",
      "service": "Prestação serviço PJ + Distrato",
      "value": "R$ 24.266,67",
      "createdAt": "27/01/2026 14:07:08",
      "competency": "01/2026",
      "nfsDocumentStatus": {
        "description": "Autorizada"
      }
    },
    {
      "id": 759758,
      "borrower": "ZASB APOIO ADMINISTRATIVO E REPRESENTACOES LTDA",
      "service": "Prestação PJ",
      "value": "R$ 13.000,00",
      "createdAt": "17/12/2025 10:44:59",
      "competency": "12/2025",
      "nfsDocumentStatus": {
        "description": "Autorizada"
      }
    },
    {
      "id": 730108,
      "borrower": "ZASB APOIO ADMINISTRATIVO E REPRESENTACOES LTDA",
      "service": "Serviço prestado de 01/11 até 30/11",
      "value": "R$ 13.000,00",
      "createdAt": "26/11/2025 09:57:57",
      "competency": "11/2025",
      "nfsDocumentStatus": {
        "description": "Autorizada"
      }
    },
    {
      "id": 723996,
      "borrower": "ZASB APOIO ADMINISTRATIVO E REPRESENTACOES LTDA",
      "service": "Serviço prestado de 01/10 a 31/10",
      "value": "R$ 13.000,00",
      "createdAt": "18/11/2025 14:01:41",
      "competency": "11/2025",
      "nfsDocumentStatus": {
        "description": "Autorizada"
      }
    },
    {
      "id": 720875,
      "borrower": "CONTA JA CONTABILIDADE LTDA",
      "service": "Análise e desenvolvimento de sistemas.",
      "value": "R$ 0,01",
      "createdAt": "13/11/2025 13:00:07",
      "competency": "11/2025",
      "nfsDocumentStatus": {
        "description": "Autorizada"
      }
    }
  ]
}

# Nome do arquivo de saída
output_file = 'notas_fiscais_resumo.csv'

# Selecionando e formatando os campos para o CSV
csv_columns = ['ID', 'Tomador', 'Serviço', 'Valor', 'Data Criação', 'Competência', 'Status']

with open(output_file, 'w', newline='', encoding='utf-8-sig') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=csv_columns)
    writer.writeheader()
    for item in data_json['data']:
        writer.writerow({
            'ID': item['id'],
            'Tomador': item['borrower'],
            'Serviço': item['service'],
            'Valor': item['value'],
            'Data Criação': item['createdAt'],
            'Competência': item['competency'],
            'Status': item['nfsDocumentStatus']['description']
        })