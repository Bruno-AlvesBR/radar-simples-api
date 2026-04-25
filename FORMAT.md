Formato padrao de SPEC.

Secoes obrigatorias e ordem fixa:

1. §G Goal
2. §C Constraints
3. §I Interfaces
4. §V Invariants
5. §T Tasks
6. §B Bugs

Regras:

- §G com objetivo unico e claro.
- §C em tabela com restricao e motivo.
- §I em tabela com contratos externos e internos.
- §V em tabela com propriedades que nunca podem quebrar.
- §T em tabela com backlog executavel e validacao objetiva.
- §B em tabela com falhas observadas e reforco estrutural.

Estados recomendados para §T:

- todo
- doing
- blocked
- done

Toda mudanca de implementacao deve refletir em §T.
Toda falha de teste deve gerar ou atualizar item em §B.
Toda causa recorrente deve virar ou fortalecer item em §V.
