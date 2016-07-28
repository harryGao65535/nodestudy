var http = require('http'); //引入头文件

http.createServer(function (req,res) {
    res.writeHead(200,{'Content-Type':'text/html'});
    res.write('<h1>hello world!</h1>');
    res.end('<h2>begin!</h2>'); 
}).listen(3000);

