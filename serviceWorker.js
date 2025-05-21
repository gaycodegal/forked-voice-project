
const addResourcesToCache = async (resources) => {
	const cache = await caches.open("v1");
	await cache.addAll(resources);
};

const putInCache = async (request, response) => {
	const cache = await caches.open("v1");
	await cache.put(request, response);
};

self.addEventListener('install', (event) => {
	event.waitUntil(
		addResourcesToCache([
		'/',
		'/favicon.svg',
		'/manifest.json'
		])
	);
});

const cacheFirst = async (request, event) => {
	const responseFromCache = await caches.match(request);
	if (responseFromCache) {
		return responseFromCache;
	}
	const responseFromNetwork = await fetch(request);
	event.waitUntil(putInCache(request, responseFromNetwork.clone()));
	return responseFromNetwork;
};

self.addEventListener("fetch", (event) => {
	event.respondWith(cacheFirst(event.request, event));
});
