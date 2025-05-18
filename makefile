SOURCES=$(wildcard src/*.ts)
DATA=$(wildcard src/*.json)

.PHONY: all

all: main.js icons/ftvt_512.png icons/ftvt_512.png

main.js: $(SOURCES) $(DATA)
	gcc -E -P -x c src/main.ts -o _temp.ts
	tsc -t es5 -strict _temp.ts
	mv _temp.js main.js
	rm _temp.ts

icons:
	mkdir icons

icons/ftvt_192.png: favicon.svg
	inkscape $< -o $@ -w 192 -h 192

icons/ftvt_512.png: favicon.svg
	inkscape $< -o $@ -w 512 -h 512
