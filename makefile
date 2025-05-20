SOURCES=$(wildcard src/*.ts)
DATA=$(wildcard src/*.json)

.PHONY: all uncheckedBuild

all: main.js icons/ftvt_512.png icons/ftvt_192.png

main.js: $(SOURCES) $(DATA)
	tsc --strict src/main.ts --noEmit  --resolveJsonModule --esModuleInterop -t esnext --moduleResolution bundler
	esbuild --bundle --minify src/main.ts --outfile=$@

uncheckedBuild:
	esbuild --bundle --minify src/main.ts --outfile=$@

icons:
	mkdir icons

icons/ftvt_192.png: favicon.svg
	inkscape $< -o $@ -w 192 -h 192

icons/ftvt_512.png: favicon.svg
	inkscape $< -o $@ -w 512 -h 512
