import {RecordStats, Recording} from "./recording"

interface NotesEntry {
	id: number;
	notes: string;
}

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
			};
			openRequest.onerror =(event) => {
				reject(null);
			};
			openRequest.onupgradeneeded = (event) => {
				// @ts-ignore
				const db = event.target.result; // Literally from MDN…
				const statsStore = db.createObjectStore("recordings", {keyPath: "id"});
				const notesStore = db.createObjectStore("notes", {keyPath: "id"});
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

	async setAvailable(b: boolean) {
		if (b) {
			await this.tryClosedOpen()
		} else {
			await this.close();
		}
	}

	store(objectStoreName: string, key: string, value: any) {
		if (this.db == null) {
			return;
		}
		const transaction = this.db.transaction(objectStoreName);
		const objectStore = transaction.objectStore(objectStoreName);
		objectStore.add(key, value);

	}

	async getNotes(): Promise<NotesEntry[]> {
		return new Promise((resolve, reject) => {
			if (this.db == null) {
				return resolve([]);
			}
			const transaction = this.db.transaction(["notes"]);
			const objectStore = transaction.objectStore("notes");
			const request = objectStore.getAll();
			request.onsuccess = (event) => {
				resolve(request.result);
			};
			request.onerror = (event) => {
				resolve([]);
			}
		});
	}
	get(objectStoreName: string, key: string): any|null {
		if (this.db == null) {
			return null;
		}
		const transaction = this.db.transaction(objectStoreName);
		const objectStore = transaction.objectStore(objectStoreName);
		return objectStore.get(key);
	}

	addRecording(stats: RecordStats, recording: Blob, notes: string = ""): boolean {
		if (!this.db) {
			return false;
		}
		const transaction = this.db.transaction(["recordings"], "readwrite");
		transaction.objectStore("recordings").add({
			"id": stats.id,
			"stats": stats,
			"recording": recording,
			"notes": notes
		});
		if (notes != "") {
			transaction.objectStore("notes").add(notes, stats.id);
		}
		return true;
	}
	deleteRecording(id: number) {
		if (!this.db) {
			return false;
		}
		const transaction = this.db.transaction(["recordings"], "readwrite");
		transaction.objectStore("recordings").delete(id);
		return true;
	}

	updateNotes(id: number, notes: string): boolean {
		if (!this.db) {
			return false;
		}
		const transaction = this.db.transaction(["notes"], "readwrite");
		transaction.objectStore("notes").put({"id": id, "notes": notes});
		return true;
	}

	async getRecordings(): Promise<Recording[]> {
		const recordings : Recording[] = await new Promise((resolve, reject) => {
			if (this.db == null) {
				return resolve([]);
			}
			const transaction = this.db.transaction(["recordings"]);
			const request = transaction.objectStore("recordings").getAll();
			if (request == null) {
				reject(null);
			}
			request.onsuccess = (event) => {
				resolve(request.result);
			};
			request.onerror =(event) => {
				reject(null);
			};
		});
		const notes = await this.getNotes();
		const notes_dict : {[id: number]: string} = {};
		notes.forEach((entry, index) => notes_dict[entry.id] = entry.notes);
		for (const entry of recordings) {
			if (entry.id in notes_dict) {
				entry.notes = notes_dict[entry.id];
			}
		}
		return recordings;
	}
}
