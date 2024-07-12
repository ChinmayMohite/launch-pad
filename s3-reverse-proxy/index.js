const express = require("express");
const httpProxy = require("http-proxy");

const app = express();

const PORT = 8000;
const BASE_PATH = "https://launchpad-project.s3.ap-south-1.amazonaws.com/__outputs"
const proxy = httpProxy.createProxy();

app.use((req,res)=>{
  const hostName = req.hostname;
  const subdomian = hostName.split('.')[0];
  const resolveTo = `${BASE_PATH}/${subdomian}`;
  proxy.web(req,res,{target: resolveTo, changeOrigin: true});
})

proxy.on('proxyReq',(proxyRep,req,res)=>{
  const url = req.url;
  if(url === '/'){
    proxyRep.path += 'index.html';
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
