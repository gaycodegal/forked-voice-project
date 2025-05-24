import {RecordStats} from "./recording"


export class Database {
	db: IDBDatabase | null;
	name: string;

	constructor (name: string, db: IDBDatabase | null = null) {
		this.db = db;
		this.name = name;
	}

	public static async construct(name: string, open: boolean) {
		const ret = new Database(name, null);
		return ret.tryOpenIf(open);
	}

	isOpen(): boolean {
		return !!this.db;
	}

	async close() {
		if (this.db) {
			this.db.close();
			this.db = null;
		}
	}

	async tryOpen(): Promise<boolean> {
		await this.close();
		this.db = await new Promise((resolve, reject) => {
			const openRequest = window.indexedDB.open(this.name);
			if (openRequest == null) {
				reject(null);
			}
			openRequest.onsuccess = (event) => {
				resolve(openRequest.result);
				console.log("successfully opened indexedDB");
			};
			openRequest.onerror =(event) => {
				console.log("Could not open database:\n" + event);
				reject(null);
			};
		});
		return !!this.db;
	}
	async tryOpenIf(b: boolean): Promise<boolean> {
		if (b) {
			return this.tryOpen();
		} else {
			return false;
		}
	}

	async tryClosedOpenIf(b: boolean) {
		if (this.db) {
			return true;
		} else if (!b) {
			return false;
		} else {
			return this.tryOpen();
		}
	}
	
	async tryClosedOpen() {
		return this.tryClosedOpenIf(true);
	}

	store(objectStoreName: string, key: string, value: any) {
		if (this.db == null) {
			return;
		}
		const transaction = this.db.transaction(objectStoreName);
		const objectStore = transaction.objectStore(objectStoreName);
		objectStore.add(key, value);

	}

	get(objectStoreName: string, key: string): any|null {
		if (this.db == null) {
			return null;
		}
		const transaction = this.db.transaction(objectStoreName);
		const objectStore = transaction.objectStore(objectStoreName);
		return objectStore.get(key);
	}

	addRecording(stats: RecordStats, recording: Blob[]) {
		console.log(this.db);
		console.log(stats);
	}
}
