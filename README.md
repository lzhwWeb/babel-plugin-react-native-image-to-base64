# babel-plugin-react-native-image-to-base64
react native build image‘s source transform to base64

## Usage

### Step 1: Install

```sh
yarn add -D babel-plugin-react-native-image-to-base64
```

or

```sh
npm install --save-dev babel-plugin-react-native-image-to-base64
```

### Step 2: Configure `babel.config.js`

```js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [['react-native-image-to-base64', {limit: 2 * 1024}]],
};
```