# Diagrama de repositorios

```mermaid
flowchart LR
  public["studionomade-web\nPúblico"]
  core["studionomade-core\nPrivado"]
  noma["Noma\nProyecto existente"]
  vercel["Vercel\nWeb + Admin"]
  public -->|"instala y despliega de forma autónoma"| vercel
  core -. "sin dependencia de build" .- public
  noma -. "integración futura por contratos" .-> public
```

`studionomade-web` debe instalarse, probarse y desplegarse sin clonar `studionomade-core`. El repositorio público no almacena know-how, reglas comerciales ni secretos. Noma permanece fuera de este repositorio.
