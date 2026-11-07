"""Build and serve locally. Change the port with --port."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit
from build import ROOT, DIST, build

class ReaderHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, audit=False, **kwargs):
        self.audit = audit
        super().__init__(*args, **kwargs)

    def do_GET(self):
        path = urlsplit(self.path).path
        audit_files = {
            "/__audit__/axe.js": ROOT / "tests/vendor/axe.min.js",
            "/__audit__/bootstrap.js": ROOT / "tests/audit-bootstrap.js",
        }
        if self.audit and (path in {"/", "/index.html"} or path in audit_files):
            if path in audit_files:
                payload = audit_files[path].read_bytes()
                kind = "text/javascript; charset=utf-8"
            else:
                html = (DIST / "index.html").read_text(encoding="utf-8")
                scripts = '<script defer src="/__audit__/axe.js"></script><script defer src="/__audit__/bootstrap.js"></script>'
                payload = html.replace("</head>", scripts + "</head>").encode()
                kind = "text/html; charset=utf-8"
            self.send_response(200)
            self.send_header("Content-Type", kind)
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return
        super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

if __name__ == "__main__":
    args = argparse.ArgumentParser()
    args.add_argument("--port", default=8765, type=int)
    args.add_argument("--audit", action="store_true", help="run bundled axe accessibility checks after navigation")
    options = args.parse_args()
    port = options.port
    build()
    with ThreadingHTTPServer(("127.0.0.1", port), partial(ReaderHandler, directory=str(DIST), audit=options.audit)) as server:
        print(f"Signal Atlas is ready at http://127.0.0.1:{port}/", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
