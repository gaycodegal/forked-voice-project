main.js: main.ts texts.json
	gcc -E -P -x c $< -o _temp.ts
	tsc -strict _temp.ts
	mv _temp.js main.js
	rm _temp.ts
