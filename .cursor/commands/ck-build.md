Execute o proximo incremento usando `SPEC.md` como contrato primario.

Fluxo:
- ler `SPEC.md`.
- selecionar tarefa com status `todo` ou `doing`.
- implementar mudancas minimas necessarias.
- validar com testes e checagens relevantes.
- atualizar status da tarefa em `SPEC.md`.
- se houver falha, registrar em `§B` e reforcar `§V` quando aplicavel.

Regras:
- evitar escopo fora da tarefa alvo.
- manter arquitetura e contratos definidos na spec.
- cada mudanca deve ter validacao objetiva.

Saida esperada:
- codigo implementado
- `SPEC.md` atualizado
- relatorio curto com tarefa concluida e validacao executada
