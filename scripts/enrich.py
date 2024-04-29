import os
import re

result = [
    os.path.join(dp, f)
    for dp, dn, filenames in os.walk("./src/packs")
    for f in filenames
]

substituions = [
    (r"DC\s(\d\d)\s(?:\w+)\s\((\w+)\)", r"[[/skill \2 \1]]"),
    (r"DC\s(\d\d)\s(?:\w+)\s\(Sleight of Hand\)", r"[[/skill sleightOfHand \1]]"),
    (
        r"DC\s(\d\d)\s(?:\w+)\s\((\w+) or (\w+)\)",
        r"[[/skill \2 \1]] or [[/skill \3 \1]]",
    ),
    (r"DC\s(\d\d)\s(?=(...))\w+\scheck", r"[[/check \2 \1]] check"),
    (r"DC\s(\d\d)\s(?=(...))\w+\ssaving throw", lambda s: f'[[/save {s.group(1).lower()} {s.group(2)} format=long]]'),
]

for file_path in result:
    print(file_path)

    with open(file_path, "r") as file:
        filedata = file.read()

    for sub in substituions:
        filedata = re.sub(sub[0], sub[1], filedata)

    with open(file_path, "w") as file:
        file.write(filedata)
