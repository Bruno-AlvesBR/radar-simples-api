Adaptacao local do fluxo cavekit para Cursor.

Arquivos:

- `SPEC.md`
- `FORMAT.md`
- `.cursor/commands/ck-spec.md`
- `.cursor/commands/ck-build.md`
- `.cursor/commands/ck-check.md`
- `scripts/install-cavekit-any-project.ps1`

Como usar neste repositorio:

1. abrir chat do Cursor.
2. executar `/ck-spec` para ajustar `SPEC.md`.
3. executar `/ck-build` para implementar tarefas da spec.
4. executar `/ck-check` para auditoria de drift.

Como aplicar em qualquer projeto:

1. copiar pasta `scripts` e os arquivos de raiz listados acima.
2. executar `powershell -ExecutionPolicy Bypass -File scripts/install-cavekit-any-project.ps1 -TargetProjectPath "<caminho-projeto>"`.
3. abrir o projeto alvo no Cursor.
4. executar `/ck-spec`, `/ck-build`, `/ck-check`.

Principio:

- `SPEC.md` vira memoria duravel de objetivo, contratos, invariantes, tarefas e bugs.
