#! /usr/bin/python


from typing import TextIO
import html
import html.parser

def make_tag(tag: str, attrs: list[tuple[str, str|None]], exclude: set[str] = set()) -> str:
    ret = f"<{tag}"
    for k,v in attrs:
        if k not in exclude:
            if v is not None:
                ret += f' {k}="{html.escape(v)}"'
            else:
                ret += f" {k}"

    return ret + ">"

class MyParser(html.parser.HTMLParser):
    output: TextIO
    open_tag: str|None = None

    def __init__(self, output: TextIO) -> None:
        super(MyParser, self).__init__()
        self.output = output

    def handle_decl(self, decl: str) -> None:
        self.output.write(f"<!{decl}>")

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_map = {k:str(v) for (k,v) in attrs}
        match tag:
            case 'link':
                if attr_map["rel"] == "stylesheet" and attr_map['href'] is not None:
                    with open(attr_map['href'], 'r') as stylesheet:
                        self.output.write(make_tag('style', attrs, {"href", "rel"}))
                        self.output.write(stylesheet.read())
                        self.open_tag = "style"
                else:
                    self.output.write(make_tag(tag, attrs))
            case 'script':
                if attr_map["src"] is not None:
                    with open(attr_map["src"], "r") as script:
                        self.output.write(make_tag(tag, attrs, {"src"}))
                        self.output.write(script.read())
                else:
                    self.output.write(make_tag(tag, attrs))
            case _:
                self.output.write(make_tag(tag, attrs))

    def handle_endtag(self, tag: str) -> None:
        if self.open_tag:
            self.output.write(f"</{self.open_tag}>")
            self.open_tag = None
        else:
            self.output.write(f"</{tag}>")

    def handle_data(self, data: str) -> None:
        self.output.write(data)

def main() -> int:
    import argparse
    arg_parser = argparse.ArgumentParser()
    arg_parser.add_argument('-i', '--input', type=argparse.FileType("r"))
    arg_parser.add_argument('-o', '--output', type=argparse.FileType("w"))
    parsed = arg_parser.parse_args()

    parser = MyParser(parsed.output);
    parser.feed(parsed.input.read())
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
