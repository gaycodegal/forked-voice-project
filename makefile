SOURCES=$(wildcard src/*.ts)
DATA=$(wildcard src/*.json)

main.js: $(SOURCES) $(DATA)
	gcc -E -P -x c src/main.ts -o _temp.ts
	tsc -t es5 -strict _temp.ts
	mv _temp.js main.js
	rm _temp.ts
