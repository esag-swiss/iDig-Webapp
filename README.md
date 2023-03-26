# idig

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Configuration
First fillin the header with the settings 'server', 'project', 'user' and "password" then click on connexion. Localhost for iDig-server is set by default as well as user "idig". If you need another additional project you have to edit the Preferences.json file prior building. If connexion is valid settings will be stored in localy to be used in the future until change is made by user.
A list of trenches of your project should be added in file Preferences.json as an array property of "YourProject" object.