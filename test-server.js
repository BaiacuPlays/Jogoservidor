const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Servidor de teste funcionando!', url: req.url }));
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Servidor de teste rodando na porta ${PORT}`);
});
