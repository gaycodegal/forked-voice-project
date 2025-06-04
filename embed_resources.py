#! /usr/bin/python3

import pathlib as pl
from typing import TextIO
import html
import html.parser

def make_tag(tag: str, attrs: list[tuple[str, str|None]], exclude: set[str] = set(), startendtag: bool = False) -> str:
    ret = f"<{tag}"
    for k,v in attrs:
        if k not in exclude:
            if v is not None:
                ret += f' {k}="{html.escape(v)}"'
            else:
                ret += f" {k}"

    if startendtag:
        ret += "/"
    return ret + ">"

class MyParser(html.parser.HTMLParser):
    output: TextIO
    basedir: pl.Path
    minify: bool;

    def __init__(self, output: TextIO, basedir: pl.Path, minify: bool) -> None:
        super(MyParser, self).__init__()
        self.output = output
        self.basedir = basedir
        self.minify = minify

    def handle_decl(self, decl: str) -> None:
        self.output.write(f"<!{decl}>")

    def get_script_path(self, name:str) -> pl.Path:
        if (self.minify):
            path = pl.Path(name)
            return self.basedir/path.parent/(path.stem + "-minified" + path.suffix)
        else:
            return self.basedir/pl.Path(name)

    def handle_starttag_custom(self, tag: str, attrs: list[tuple[str, str | None]], startendtag: bool = False) -> None:
        attr_map = {k:str(v) for (k,v) in attrs}
        match tag:
            case 'link':
                if attr_map["rel"] == "stylesheet" and attr_map['href'] is not None:
                    with (self.basedir/pl.Path(attr_map['href'])).open('r') as stylesheet:
                        self.output.write(make_tag('style', attrs, {"href", "rel"}))
                        self.output.write(stylesheet.read())
                        self.open_tag = "style"
                    if startendtag:
                        self.handle_endtag("style")
                else:
                    self.output.write(make_tag(tag, attrs, set(), startendtag))
            case 'script':
                if attr_map["src"] is not None:
                    with self.get_script_path(attr_map["src"]).open('r') as script:
                        self.output.write(make_tag(tag, attrs, {"src"}))
                        self.output.write(script.read())
                    if startendtag:
                        self.handle_endtag("script")
                else:
                    self.output.write(make_tag(tag, attrs, set(), startendtag))
            case _:
                self.output.write(make_tag(tag, attrs, set(), startendtag))

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        return self.handle_starttag_custom(tag, attrs, True)

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        return self.handle_starttag_custom(tag, attrs, False)

    def handle_endtag(self, tag: str) -> None:
        self.output.write(f"</{tag}>")

    def handle_data(self, data: str) -> None:
        self.output.write(data)

def main() -> int:
    import argparse
    arg_parser = argparse.ArgumentParser()
    arg_parser.add_argument('-i', '--input', type=argparse.FileType("r"))
    arg_parser.add_argument('-o', '--output', type=argparse.FileType("w"))
    arg_parser.add_argument('-m', '--minified-scripts', action="store_true")
    parsed = arg_parser.parse_args()

    basedir = pl.Path(parsed.input.name).parent if (parsed.input.name and parsed.input.name != "<stdin>") else pl.Path(".")
    print(basedir)
    parser = MyParser(parsed.output, basedir, parsed.minified_scripts);
    parser.feed(parsed.input.read())
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
