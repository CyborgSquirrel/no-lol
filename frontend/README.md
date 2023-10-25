# Introduction

Proiectul a fost creat cu **WebStorm 2023.2.3**, folosind **Vite**.

**Note:** un feature de la **Vite** este sa actualizeze pagina dinamic in timp ce scrii codul. Nu este necesar sa dai refresh.

Urmatoarele package-uri sunt deja trecute in fisierele [package.json](package.json) si [package-lock.json](package-lock.json):
- Material UI v5 (component library)
- Material UI Icons (icons)
- React Router v6 (Single-Page Application router for navigation)
- axios (http client)

# Setup
Asigurate ca ai instalat:
- [node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com/)

Pentru proiect am folosit `node.js` versiunea `16.18.1` si `npm` versiunea `8.19.2`.
Nu stiu daca este necesar sa aveti aceleasi versiuni.

Ruleaza urmatoarea comanda in folderul `frontend` pentru a instala toate package-urile:
```sh
npm install
```

# Running

Ruleaza serverul web din:

- **terminal**
    ```sh
    npm run dev
    ```

- **WebStorm**

    apasa butonul de run din coltul din dreapta sus

# Conventions

Daca vrei sa fii cool 😎, atunci respecta urmatoarele conventii:

- `PascalCase`: class / interface / type / enum
- `camelCase (lower one)`: variable / parameter / function / method / propery / module alias
- `CONSTANT_CASE`: global constant values / enum values
- indent: 4 whitespaces (**no tabs**)

Tips:

- in **Visual Studio Code** poti activa `Use Tab Stops` din settings pentru a face spatiile sa se comporte ca taburi

# Useful Links
- Material UI: https://mui.com/material-ui/getting-started/
- Material UI Icons: https://mui.com/material-ui/material-icons/
- React Router: https://reactrouter.com/en/main
- axios: https://axios-http.com/docs/intro
