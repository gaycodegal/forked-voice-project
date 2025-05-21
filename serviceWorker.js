
const cachedResources = [
	'/',
	'/favicon.svg',
	'/manifest.json',
	'/icons/ftvt_192.png',
	'/icons/ftvt_512.png',
];

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
		addResourcesToCache(cachedResources)
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

self.addEventListener("message", async (event) => {
	if (event.data && event.data.type === "delete caches") {
		const cache = await caches.open("v1");
		for (const resource of cachedResources) {
			await cache.delete(resource);
		}
	}
});
