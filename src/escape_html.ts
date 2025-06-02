
enum TagType {
	Open,
	Close,
	OpenClose,
	Raw
}

interface Tag {
	name: string;
	lang: string|null;
	raw: string;
	type: TagType;
}

export function escapeHTML(raw: string): string {
	return new Option(raw).innerHTML;
}


function parseTag(raw: string): [Tag, string] {
	const end = raw.indexOf('>');
	if (end == -1) {
		return [{
			name: "",
			lang: null,
			raw: raw,
			type: TagType.Raw
		}, ""];
	}
	const rawTag = raw.slice(0, end);
	const tail = raw.slice(end);
	return [{
		name: "",
		lang: null,
		raw: rawTag,
		type: TagType.OpenClose
	}, tail];
}

function handleTag(tag: Tag): string {
	const acceptedTags = ["q", "emph", "strong", "p", "br", "blockquote", "span", "div"];
	if ((tag.name == "") || !(tag.name in acceptedTags)) {
		return escapeHTML(tag.raw);
	}
	switch(tag.type) {
		case TagType.Open:
			if (tag.lang != null) {
				return "<" + tag.name + " lang=\"" + tag.name + "\">";
			} else {
				return "<" + tag.name + ">";
			}
		case TagType.Close:
			return "</" + tag.name + ">";
		case TagType.OpenClose:
			if (tag.lang != null) {
				return "<" + tag.name + " lang=\"" + tag.name + "\" />";
			} else {
				return "<" + tag.name + "/>";
			}
		case TagType.Raw:
			return escapeHTML(tag.raw);
	}
}

export function filterSafeHTML(raw: string): string {
	let ret = "";
	let specialStart = raw.search("/<|>|\"|'/");
	while (specialStart != -1) {
		ret += raw.slice(0, specialStart);
		raw = raw.slice(specialStart);
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
