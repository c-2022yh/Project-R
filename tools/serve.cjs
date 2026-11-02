// 프론트엔드 확인용 정적 서버. 참가자 등록·기록 저장용 백엔드는 아님.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const files = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/index.html": ["index.html", "text/html; charset=utf-8"],
  "/css/style.css": ["css/style.css", "text/css; charset=utf-8"],
  "/js/game.js": ["js/game.js", "text/javascript; charset=utf-8"],
  "/js/app.js": ["js/app.js", "text/javascript; charset=utf-8"],
};
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  const file = files[pathname];
  if (!file || !["GET", "HEAD"].includes(req.method)) {
    res.writeHead(404); res.end("Not found"); return;
  }
  fs.readFile(path.join(root, file[0]), (error, content) => {
    if (error) { res.writeHead(500); res.end("Could not read file"); return; }
    res.writeHead(200, { "Content-Type": file[1], "Cache-Control": "no-store" });
    res.end(req.method === "HEAD" ? undefined : content);
  });
});
server.on("error", (error) => { console.error(error.message); process.exitCode = 1; });
server.listen(Number(process.env.PORT || 4173), "127.0.0.1", () => {
  console.log(`Project-R: http://127.0.0.1:${server.address().port}`);
});
