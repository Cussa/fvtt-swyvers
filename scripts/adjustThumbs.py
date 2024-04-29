import os
from pathlib import Path
import re
import shutil

regexPattern = r"\"thumb\": \"(worlds/(.*)/assets/scenes/(.*))\","

current_path = os.getcwd()

data_folder = Path(os.getcwd()).parent.parent.absolute()

module_name = os.path.basename(current_path)

origin_format = "{}/worlds/{}/assets/scenes/{}"
destiny_format = "assets/maps/thumbs/{}"
module_format = "modules/{}/assets/maps/thumbs/{}"

result = [
    os.path.join(dp, f)
    for dp, _, filenames in os.walk("./src/packs")
    for f in filenames
]

if not os.path.exists(destiny_format.format("")):
    os.makedirs(destiny_format.format(""))

for file_path in result:
    with open(file_path, "r") as file:
        filedata = file.read()

    for match in re.finditer(regexPattern, filedata):
        full_origin = origin_format.format(data_folder, match[2], match[3])
        full_destiny = destiny_format.format( match[3])
        shutil.copy2(full_origin, full_destiny)
        thumb_new_path = module_format.format(module_name, match[3])
        filedata = filedata.replace(match[1], thumb_new_path)

    with open(file_path, "w") as file:
        file.write(filedata)
