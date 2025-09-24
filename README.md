CheckList - App React Native (Expo)

Rápido: app Expo que renderiza um checklist semanal com persistência local.

Pré-requisitos
- Node.js instalado
- Expo CLI (recomendado instalar globalmente) - `npm install -g expo-cli` ou use `npx expo`

Instalação

Abra o PowerShell na pasta do projeto e rode:

```powershell
npm install
expo start
```

Testar no celular: escaneie o QR code no terminal com o app Expo Go.

Arquivos principais
- `App.js` - entrypoint
- `src/ChecklistScreen.jsx` - UI e persistência
- `src/data/items.js` - lista de itens do checklist

Funcionalidades
- Marca/desmarca célula por dia
- Persistência local
- Botão para resetar tudo
- Botão para exportar JSON (mostra em alerta)
