Toaster Uploader
=======

## 概述

Toaster Uploader是一款基于 Electron + Vue.js 的牛云存储图片上传桌面客户端
![Toaster Uploader](http://yangjian.qiniudn.com/FuAlMdoJxWrc1uXuxjQeWj8R1xqm)
![Toaster Uploader](http://yangjian.qiniudn.com/FujkPWN8heEhPgYPfWkZxZMrA_uA)

## 功能

- 可选的图片无损压缩功能
- 简单的拖拽上传，自动生成图片URL
- 小于10KB的图片会自动生成DataURL

## 使用方法

- 安装Mac客户端，提示『开发者不安全』请到『设置-安全性和隐私』中点击左下角的锁头允许本软件的运行
- 首次打开会提示输入七牛云的密钥
- 将图片拖入到左侧区域

## 注意事项

- 目前只针对 Mac 平台进行了打包，可以直接[点击这里下载Mac版本](https://raw.githubusercontent.com/A-limon/toaster-uploader/master/build/mac/Toaster%20Uploader.zip)
- 如果需要打包Window平台的版本，请参考electron-prebuilt的使用说明进行Build

## 开发指南

init 

```node
$ npm install 
```

dev

```node
$ npm run start
```

build

```node
$ npm run build-mac
```

## License

(The MIT License)

Copyright (c) 2016 YangJian &lt;yangjian@lantouzi.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
