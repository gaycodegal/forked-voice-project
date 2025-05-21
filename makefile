SOURCES=$(wildcard src/*.ts)
DATA=$(wildcard src/*.json)

.PHONY: all uncheckedBuild

all: bundeled.html main.js icons/ftvt_512.png icons/ftvt_192.png

bundeled.html: main.html main.js main.css custom.css makefile
	./embed_resources.py -i main.html -o $@


main.js: $(SOURCES) $(DATA) makefile
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
