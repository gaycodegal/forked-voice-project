SOURCES=$(wildcard src/*.ts)
DATA=$(wildcard src/*.json)
SW_SOURCES=$(wildcard serviceWorker/*.ts)

.PHONY: all uncheckedBuild clean

all: deployable out/main.html out/main.js out/icons/ftvt_512.png out/icons/ftvt_192.png out/serviceWorker.js

out:
	mkdir -p out

clean:
	rm -rf out

out/serviceWorker.js: $(SW_SOURCES) out
	tsc --strict serviceWorker/main.ts --noEmit -t es6 --lib es2019,es6,dom,webworker --skipLibCheck
	esbuild --bundle serviceWorker/main.ts --outfile=$@

out/main.html: static/main.html out/main.css out/custom.css out
	cp $< $@

out/main.css: static/main.css out
	cp $< $@

out/custom.css: static/custom.css out
	cp $< $@

out/main.js: $(SOURCES) $(DATA) legal.json
	tsc --strict src/main.ts --noEmit  --resolveJsonModule --esModuleInterop -t esnext --moduleResolution bundler
	esbuild --bundle src/main.ts --outfile=$@

deployable: out legal.json out/main.html
	esbuild --bundle --minify src/main.ts --outfile=out/main-minified.js
	./embed_resources.py -i out/main.html -o out/bundeled.html -m
	esbuild --bundle serviceWorker/main.ts --outfile=out/serviceWorker.js

out/mainfest.json: mainfest.json
	cp $< $@

out/icons: out
	mkdir -p $@

out/icons/ftvt_192.png: icons/favicon.svg out/icons
	inkscape $< -o $@ -w 192 -h 192

out/icons/ftvt_512.png: icons/favicon.svg out/icons out/icons/ftvt_192.png
	# Depends on the 192px version because inkscape seems to choke badly if it's run twice in parallel…
	inkscape $< -o $@ -w 512 -h 512

legal.json : | legal.json.sample
	@echo "WARNING: Using sample-file as fallback for legal.json; PLEASE edit it to describe the actual situation, the GDPR legaly requires you to do that!"
	cp legal.json.sample $@
