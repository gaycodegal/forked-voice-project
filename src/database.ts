
export class Database {
	db: IDBDatabase | null;
	name: string;

	constructor (name: string, db: IDBDatabase | null = null) {
		this.db = db;
		this.name = name;
	}

	public static async construct(name: string, open: boolean) {
		const ret = new Database(name, null);
		return ret.try_open_if(open);
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

	async try_open(): Promise<boolean> {
		await this.close();
		const result = await window.indexedDB.open(this.name);
		if (result.error) {
			this.db = null;
			return false;
		} else {
			this.db = result.result;
			return true;
		}
	}
	async try_open_if(b: boolean): Promise<boolean> {
		if (b) {
			return this.try_open();
		} else {
			return false;
		}
	}

	async try_closed_open_if(b: boolean) {
		if (this.db) {
			return true;
		} else if (!b) {
			return false;
		} else {
			return this.try_open();
		}
	}
	
	async try_closed_open() {
		return this.try_closed_open_if(true);
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
}
