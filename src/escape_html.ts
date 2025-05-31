
export function escapeHTML(raw: string): string {
	return new Option(raw).innerHTML;
}



function parseTag(raw: string): [string, string] {
	const end = raw.indexOf('^>');
	if (end == -1) {
		return [escapeHTML(raw), ""];
	}
}

export function filterSafeHTML(raw: string): string {
	let ret = "";
	let specialStart = raw.search("/<|>|\"|'/");
	while (specialStart != -1) {
		ret += raw.slice(0, specialStart);
		raw = raw.slize(specialStart);
		switch(raw[0]) {
			case '"':
				ret += "&quot;";
				raw = raw.slice(1);
				break;
			case "'":
				ret += "&apos;";
				raw = raw.slice(1);
				break;
			case '>':
				ret += "&gt;";
				raw = raw.slice(1);
				break;
			case '<':
				let [tag, tail] = parseTag(raw);
				ret += handleTag(tag);
				raw = tail;
			default:
				throw new Error("Error when parsing string; this should never happen!");
		}
	}
	return ret + raw;
}
