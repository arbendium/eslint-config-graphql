export default class ModuleCache {
	constructor() {
		this.map = new Map();
	}

	set(cacheKey, result) {
		this.map.set(cacheKey, { lastSeen: process.hrtime(), result });
	}

	get(cacheKey, settings = { lifetime: 10 }) {
		const value = this.map.get(cacheKey);

		if (value) {
			const { lastSeen, result } = value;

			if (process.env.NODE || process.hrtime(lastSeen)[0] < settings.lifetime) {
				return result;
			}
		}
	}
}
