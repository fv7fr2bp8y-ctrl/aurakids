import json, sys, unicodedata, re, collections, gzip
src, out = sys.argv[1], sys.argv[2]
ACUTE, GRAVE = "́", "̀"
VOW = set("аеиоуъюяѝ")
CYR = re.compile(r"^[а-яѝ́̀]+$")
pos = collections.defaultdict(set)
n = 0
for line in open(src, encoding="utf-8"):
    e = json.loads(line)
    forms = [f.get("form", "") for f in e.get("forms", [])]
    for ht in e.get("head_templates", []):
        forms += [v for v in ht.get("args", {}).values() if isinstance(v, str)]
    for f in forms:
        f = unicodedata.normalize("NFC", f.strip().lower())
        if " " in f or not f or not CYR.match(f):
            continue
        d = unicodedata.normalize("NFD", f).replace(GRAVE, ACUTE)
        d = unicodedata.normalize("NFC", d)
        # keep "ѝ" (precomposed) as a letter; count only acute marks
        k = d.count(ACUTE)
        plain = d.replace(ACUTE, "")
        vowels = sum(1 for c in plain if c in VOW)
        if vowels < 2:
            continue
        if k != 1:
            continue  # unmarked or doubly marked spelling: no information
        i = d.index(ACUTE) - 1
        pos[plain].add(i)
    n += 1
clean = {w: next(iter(p)) for w, p in pos.items() if len(p) == 1}
amb = sum(1 for w, p in pos.items() if len(p) > 1)
print("entries", n, "forms", len(pos), "unique stress", len(clean), "ambiguous", amb)
with gzip.open(out, "wt", encoding="utf-8") as g:
    for w in sorted(clean):
        g.write(f"{w}\t{clean[w]}\n")
for t in ["дракон","дракона","драконът","пещера","пещерата","сажди","камъкът","планина","скалата","хората","злодей","студената","високото","замъка","замъкът"]:
    print(t, clean.get(t), pos.get(t))
