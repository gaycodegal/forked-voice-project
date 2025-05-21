SOURCES=$(wildcard src/*.ts)
DATA=$(wildcard src/*.json)
SW_SOURCES=$(wildcard serviceWorker/*.ts)

.PHONY: all uncheckedBuild

all: bundeled.html main.js icons/ftvt_512.png icons/ftvt_192.png serviceWorker.js

serviceWorker.js: $(SW_SOURCES)
	tsc --strict serviceWorker/main.ts --noEmit -t es6 --moduleResolution bundler --lib es2019,es6,dom,webworker --skipLibCheck
	esbuild --bundle serviceWorker/main.ts --outfile=$@

bundeled.html: main.html main.js main.css custom.css
	./embed_resources.py -i main.html -o $@


main.js: $(SOURCES) $(DATA)
	tsc --strict src/main.ts --noEmit  --resolveJsonModule --esModuleInterop -t esnext --moduleResolution bundler
	esbuild --bundle src/main.ts --outfile=$@

uncheckedBuild:
	esbuild --bundle --minify src/main.ts --outfile=main.js
	./embed_resources.py -i main.html -o bundeled.html

icons:
	mkdir icons

icons/ftvt_192.png: favicon.svg
	inkscape $< -o $@ -w 192 -h 192

icons/ftvt_512.png: favicon.svg
	inkscape $< -o $@ -w 512 -h 512
