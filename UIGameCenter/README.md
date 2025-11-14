# UIGameCenter

La rama principal es main

**Descripción**: Proyecto móvil (Expo / React Native) que funciona como una interfaz para Game Center: muestra juegos, eventos y grupos. Este README contiene solo lo necesario para compilar y ejecutar la aplicación en desarrollo.

**Requisitos**
- **Node.js**: versión 14+ recomendada.
- **npm** o **yarn**: gestor de paquetes.
- **Expo CLI** *(opcional)*: para facilitar ejecución en dispositivos/emulador. Se puede usar `npx expo` sin instalación global.

**Instalación**
- Clonar el repositorio y entrar en la carpeta del proyecto:

```powershell
git clone https://github.com/GameCenterOrganization/UIGameCenter.git
cd UIGameCenter/UIGameCenter

```

- Instalar dependencias:

```powershell
npm install
# o
yarn install
```

**Variables de entorno**
La aplicación requiere cambiar las IP para poder utilizar el proyecto en un entorno local. Crea un archivo `.env` en la raíz del proyecto con las siguientes claves (rellena con tus valores):

```
BASE_URL=
BASE_URL_GAME=
```

Si prefieres leer `.env` automáticamente en React Native/Expo, añade e integra una librería como `react-native-dotenv` o configurar `expo-constants` según tu flujo de trabajo.

**Ejecutar (desarrollo)**
- Iniciar el servidor de desarrollo con Expo:

```powershell
npx expo start -c
```


Web Bundling failed 6897ms index.js (742 modules)
Unable to resolve "react-calendar" from "src\screens\CreateEventScreen.js"
  11 | let Calendar = null;
  12 | if (Platform.OS === 'web') {
> 13 |   Calendar = require('react-calendar').default;
     |                       ^
  14 | }
  15 |
  16 | const getBaseUrl = () => {

Import stack:

 src\screens\CreateEventScreen.js
 | import "react-calendar"


 SI SALE ESTE ERROR EJECUTAR LOS SIGUIENTES COMANDOS Y LUEGO EL DE COMPILACION:
 npm install @react-native-community/datetimepicker
 npm install react-calendar

VOLVER A INICIAR EL PROYECTO:
npx expo start -c

- Abrir en dispositivo físico con Expo Go (QR) o en emulador (Android/iOS) desde la interfaz de Expo.

**Construir (opcional)**
- Para builds de producción con EAS:

```powershell
# instalar EAS si es necesario
npm install -g eas-cli
eas login
eas build -p android
eas build -p ios
```

Eso es todo lo necesario para compilar y ejecutar el proyecto en modo desarrollo.
