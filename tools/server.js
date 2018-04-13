const http = require("http");
const os = require("os");
const fs = require("fs");
const path = require("path");

const root = "./dist/courses";

const mimes = {
    ".json": "application/json",
    "default": "text/plain"
};

const server = http.createServer((req, res) => {
    
    const url = req.url;
    const filename = path.join(root, url).toLowerCase();

    fs.exists(filename, (exists) => {

        if (exists) {

            fs.readFile(filename, (err, data) => {

                if (err) {

                    printRequest(req, 500);
                    res.statusCode(500);
                    res.end();

                } else {

                    let mime = mimes[path.extname(filename)];

                    if (!mime) {
                        mime = mimes["default"];
                    }

                    printRequest(req, 200);
                    res.statusCode = 200;
                    res.setHeader("Content-Type", mime);
                    res.write(data);
                    res.end();

                }

            });

        } else {

            printRequest(req, 404);
            res.statusCode = 404;
            res.end();

        }

    });

});

server.on("clientError", (err, socket) => {
    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

function printRequest(req, status) {

    let d = new Date();
    
    console.log(`${d.toLocaleString()} ${req.method} ${req.url} - ${status}`);

}

function printHelp(addrs, port) {
    const uris = [];

    for (let i in addrs) {
        uris.push(`http://${addrs[i]}:${port}/`);
    }

    console.log(`Your entry point(s) are: ${uris.join(", ")}\n`);

    console.log(`Create a new Api instance like this:\n`);

    for (let i in uris) {
        console.log(`\tApi api = new Api("${uris[i]}");`);
    }

}

function getIpv4() {

    const ifaces = os.networkInterfaces();
    const addrs = [];

    for (let k in ifaces) {
        for (let k2 in ifaces[k]) {
            const addr = ifaces[k][k2];
            if (addr.family === "IPv4" && !addr.internal) {
                addrs.push(addr.address);
            }
        }
    }

    return addrs;

}

function main() {

    const ips = getIpv4();
    const port = 55155;

    printHelp(ips, port);

    console.log()
    server.listen(port, (err) => {

        if (err) {
            console.error(err);
            return;
        }

        console.log("Listening... Press Ctrl+C to stop.\n");

    });
}

main();