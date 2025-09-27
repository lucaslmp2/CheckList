# Checklist App

Um aplicativo de checklist semanal simples, construído com React Native e Expo. Permite que os usuários acompanhem tarefas ou hábitos diários ao longo da semana, com os dados salvos localmente no dispositivo.

## ✨ Funcionalidades

-   **Checklist Semanal:** Visualize e marque itens para cada dia da semana (Segunda a Domingo).
-   **Persistência de Dados:** O estado do seu checklist é salvo automaticamente no dispositivo, para que você não perca seu progresso.
-   **Exportação de Dados:** Exporte o estado atual do checklist como uma string JSON.
-   **Resetar Dados:** Limpe todos os dados do checklist e comece de novo.
-   **Navegação Simples:** Interface com uma tela inicial e uma tela para o checklist.

## 🚀 Tecnologias Utilizadas

-   [React Native](https://reactnative.dev/) - Framework para construção de apps nativos com React.
-   [Expo](https://expo.dev/) - Plataforma para facilitar o desenvolvimento e build de apps React Native.
-   [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) - Para persistência de dados local (armazenamento key-value).
-   [Expo Vector Icons](https://docs.expo.dev/guides/icons/) - Para uso de ícones na interface.
-   [Expo Clipboard](https://docs.expo.dev/versions/latest/sdk/clipboard/) - Para a funcionalidade de copiar o JSON para a área de transferência.

## 📋 Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão LTS recomendada)
-   [Git](https://git-scm.com/)
-   [Expo CLI](https://docs.expo.dev/get-started/installation/) (opcional, pode-se usar `npx`)
-   Um dispositivo físico com o app Expo Go ou um emulador Android/iOS.

## ⚙️ Instalação e Execução

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd CheckList
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento do Expo:**
    ```bash
    npm start
    ```
    ou
    ```bash
    expo start
    ```

4.  **Execute o aplicativo:**
    -   **No seu celular:** Instale o app **Expo Go** (disponível para [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) e [iOS](https://apps.apple.com/us/app/expo-go/id982107779)). Escaneie o QR code exibido no terminal.
    -   **No emulador Android:** Pressione `a` no terminal onde o Expo está rodando.
    -   **No simulador iOS:** Pressione `i` no terminal.

## 📜 Scripts Disponíveis

-   `npm start`: Inicia o Metro Bundler e o servidor de desenvolvimento do Expo.
-   `npm run android`: Inicia o app em um emulador ou dispositivo Android conectado.
-   `npm run ios`: Inicia o app em um simulador ou dispositivo iOS conectado.
-   `npm run web`: Inicia a versão web do aplicativo em um navegador.

## 📂 Estrutura de Arquivos

```
CheckList/
├── src/
│   ├── ChecklistScreen.jsx   # Tela principal do checklist
│   ├── HomeScreen.jsx        # Tela inicial com botões de navegação
│   ├── JSONViewerScreen.jsx  # Tela para visualizar os dados em JSON
│   └── data/
│       └── items.js          # Dados iniciais dos itens do checklist
├── assets/
│   ├── icon.png
│   └── splash.png
├── App.js                    # Componente raiz e lógica de navegação
├── package.json              # Dependências e scripts do projeto
└── README.md                 # Este arquivo
```