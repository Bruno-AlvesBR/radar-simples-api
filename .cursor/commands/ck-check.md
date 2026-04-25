Execute auditoria read-only de aderencia ao `SPEC.md`.

Checklist:
- validar se implementacoes respeitam `§I`.
- validar se invariantes de `§V` continuam verdadeiros.
- validar se tarefas em `§T` refletem estado real.
- detectar drift entre codigo e contratos declarados.

Regras:
- nao editar arquivos nesta execucao.
- gerar relatorio objetivo com violacoes.
- para cada violacao, sugerir acao de correcao.

Formato de saida:
- conformidades
- violacoes
- risco
- acao recomendada
