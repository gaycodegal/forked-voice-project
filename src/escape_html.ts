
export function escapeHTML(raw: string): string {
	raw = raw.replaceAll("&", "&amp;");
	raw = raw.replaceAll("<", "&lt;");
	raw = raw.replaceAll(">", "&gt;");
	raw = raw.replaceAll("\"", "&quot;");
	raw = raw.replaceAll("'", "&apos;");
	return raw;
}


export function rawTextToHTML(raw: string): string {
	let ret = "";
	for (const part of raw.split(/\n\n+/)) {
		const matchResult = part.match(/^@([a-zA-Z\-_])@(.*)$/)
		if (matchResult == null) {
			ret += "<p>" + escapeHTML(part) + "</p>";
		} else {
			ret += "<p lang=\"" + matchResult[1] + "\">" +escapeHTML(matchResult[2]) + "</p>\n";
		}
	}
	return ret;
}
