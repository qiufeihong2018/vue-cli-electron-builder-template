# electron-builder-demo

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## 更新
使用 `npm run build` 打包完成后，在 dist 目录下使用 python 起一个静态服务器

例如，可以 `python -m SimpleHTTPServer 7777` 起一个端口位7777的静态服务器

`vue.config.js` 文件里的配置设置为 `http://localhost:7777/dist_electron/`
## tip
```bash
#强制指定npm拉取淘宝源

npm config set registry https://registry.npm.taobao.org --global

npm config set disturl https://npm.taobao.org/dist --global

npm config set electron_mirror https://npm.taobao.org/mirrors/electron/ --global
```
