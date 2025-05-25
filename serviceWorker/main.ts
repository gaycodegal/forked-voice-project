/// <reference lib="WebWorker" />

// export empty type because of tsc --isolatedModules flag
export type {};
declare const self: ServiceWorkerGlobalScope;

const cachedResources = [
	'/',
];

async function addResourcesToCache(resources:string[]) {
	const cache = await caches.open("v1");
	await cache.addAll(resources);
}

const putInCache = async (request: Request, response: Response) => {
	const cache = await caches.open("v1");
	await cache.put(request, response);
};

self.addEventListener('install', (event) => {
	event.waitUntil(addResourcesToCache(cachedResources));
});

async function cacheFirst(request: Request, event: ExtendableEvent) {
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

const broadcastChannel = new BroadcastChannel("FTVT-channel");

self.addEventListener("message", async (event) => {
	if (event.data) {
		const cache = await caches.open("v1");
		switch (event.data.type ) {
			case("delete caches"):
				for (const resource of cachedResources) {
					await cache.delete(resource);
				}
				break;
			case "update caches":
				console.log(event);
				await cache.addAll(cachedResources);
				broadcastChannel.postMessage({type:"done"});
		}
	}
});
