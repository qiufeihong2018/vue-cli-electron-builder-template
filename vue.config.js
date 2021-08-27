const path = require('path')
module.exports = {
    // 部署应用包时的基本 URL
    publicPath: '/',
    // 生成的生产环境构建文件的目录
    outputDir: 'dist',
    // 放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录
    assetsDir: 'assets',
    // 指定生成的 index.html 的输出路径 (相对于 outputDir)。也可以是一个绝对路径。
    indexPath: 'index.html',
    // 文件名中包含hash
    filenameHashing: true,
    // 在 multi-page 模式下构建应用, 单页面一般不需要考虑（详情查看文档配置）
    pages: undefined,
    // 保存时自动触发eslint
    lintOnSave: process.env.NODE_ENV !== 'production',
    // 是否使用包含运行时编译器的 Vue 构建版本
    runtimeCompiler: false,
    // babel 显示转译一个依赖
    transpileDependencies: ['socket.io-client'],
    // 生产环境source map 关闭可提升打包速度
    productionSourceMap: false,
    // crossorigin: undefined,
    // integrity: false,
    css: {
        // modules: false,
        requireModuleExtension: true,
        extract: process.env.NODE_ENV === 'production',
        sourceMap: false,
        loaderOptions: {
            less: {
                prependData: ``
            }
        }
    },
    // 并行打包
    parallel: true, // 默认值require('os').cpus().length > 1,
    pluginOptions: {},
    // 本地开发服务器配置
    devServer: {
        // 自动打开浏览器
        open: true,
        // 设置为0.0.0.0则所有的地址均能访问
        host: '0.0.0.0',
        port: 8888,
        https: false,
        hotOnly: false,
        compress: true,
        disableHostCheck: true,
        // 使用代理
        proxy: {
            '/api': {
                // 目标代理服务器地址
                target: 'http://10.66.194.44:8081/',
                // 允许跨域
                changeOrigin: true,
            },
        },
    },
    // 针对webpack的配置，如果遇到上述配置，能使用的尽量不要改动webpack的配置
    configureWebpack: config => {
        if (process.env.NODE_ENV === 'production') {
            // 为生产环境修改配置...
            config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true;
        } else {
            // 为开发环境修改配置...
        }
    },
    // chain模式下的webpack plugin配置
    chainWebpack: config => {
        // 使用svg-sprite-loader的vue.config配置 只应用于src/icons目录下
        const svgRule = config.module.rule('svg')
        svgRule.uses.clear()
        svgRule
            .test(/\.svg$/)
            .include.add(path.resolve(__dirname, './src/icons')).end()
            .use('svg-sprite-loader')
            .loader('svg-sprite-loader')
            .options({
                symbolId: 'icon-[name]'
            })
        const fileRule = config.module.rule('file')
        fileRule.uses.clear()
        fileRule
            .test(/\.svg$/)
            .exclude.add(path.resolve(__dirname, './src/icons'))
            .end()
            .use('file-loader')
            .loader('file-loader')
        config
            .plugin('env')
            .use(require.resolve('webpack/lib/ProvidePlugin'), [{
                jQuery: 'jquery',
                $: 'jquery',
                "windows.jQuery": "jquery"
            }]);
        config.resolve.alias.set('@', path.join(__dirname, './src'))
    },
    pluginOptions: {
        electronBuilder: {
            externals: ['log4js'],
            // If you are using Yarn Workspaces, you may have multiple node_modules folders
            // List them all here so that VCP Electron Builder can find them
            nodeModulesPath: ['./node_modules'],
            nodeIntegration: true,
            chainWebpackMainProcess: (config) => {
                // 修复HMR
                config.resolve.symlinks(true);
                config.resolve.alias.set('@', path.join(__dirname, './src'))
                // Chain webpack config for electron main process only
            },
            chainWebpackRendererProcess: (config) => {
                // 修复HMR
                config.resolve.symlinks(true);
                // 使用svg-sprite-loader的vue.config配置 只应用于src/icons目录下
                const svgRule = config.module.rule('svg')
                svgRule.uses.clear()
                svgRule
                    .test(/\.svg$/)
                    .include.add(path.resolve(__dirname, './src/icons')).end()
                    .use('svg-sprite-loader')
                    .loader('svg-sprite-loader')
                    .options({
                        symbolId: 'icon-[name]'
                    })
                const fileRule = config.module.rule('file')
                fileRule.uses.clear()
                fileRule
                    .test(/\.svg$/)
                    .exclude.add(path.resolve(__dirname, './src/icons'))
                    .end()
                    .use('file-loader')
                    .loader('file-loader')
                config.resolve.alias.set('@', path.join(__dirname, './src'))
                // Chain webpack config for electron renderer process only (won't be applied to web builds)
            },
            // Changing the Output Directory
            outputDir: "dist_electron",
            // Electron's Junk Terminal Output https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/configuration.html#electron-s-junk-terminal-output
            removeElectronJunk: false,
            // Use this to change the entrypoint of your app's main process
            mainProcessFile: 'background/main.js',
            // Use this to change the entry point of your app's render process. default src/[main|index].[js|ts]
            rendererProcessFile: 'src/main.js',
            // Provide an array of files that, when changed, will recompile the main process and restart Electron
            // Your main process file will be added by default
            mainProcessWatch: ['background/main.js'],
            // Provide a list of arguments that Electron will be launched with during "electron:serve",
            // which can be accessed from the main process (src/background.js).
            // Note that it is ignored when --debug flag is used with "electron:serve", as you must launch Electron yourself
            // Command line args (excluding --debug, --dashboard, and --headless) are passed to Electron as well
            //   mainProcessArgs: ['--arg-name', 'arg-value']
            builderOptions: {
                "productName": "Vue Electron",
                "appId": "com.VueElectron",
                "publish": [{
                    "provider": "generic",
                    "url": "http://localhost:7777/dist_electron/"
                }],
                "win": {
                    "target": [
                        "nsis"
                    ],
                    "icon": "./public/favicon.ico",
                    "requestedExecutionLevel": "highestAvailable"
                },
                "nsis": {
                    "oneClick": false,
                    "allowElevation": true,
                    "allowToChangeInstallationDirectory": true,
                    "installerIcon": "./public/favicon.ico",
                    "uninstallerIcon": "./public/favicon.ico",
                    "installerHeaderIcon": "./public/favicon.ico",
                    "createDesktopShortcut": true,
                    "createStartMenuShortcut": true,
                    "perMachine": false,
                    "unicode": true,
                    "deleteAppDataOnUninstall": false
                }
            }
        }
    }
}