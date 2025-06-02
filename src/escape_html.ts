
export function escapeHTML(raw: string): string {
	return new Option(raw).innerHTML;
}


export function rawTextToHTML(raw: string): string {
	let ret = "";
	for (const part of raw.split(/\n\n+/)) {
		const matchResult = part.match(/^@([a-zA-Z\-_])@(.*)$/)
		if (matchResult == null) {
			ret += "<p>" + part + "</p>";
		} else {
			ret += "<p lang=\"" + matchResult[1] + "\">" + matchResult[2] + "</p>\n";
		}
	}
	return ret;
}
