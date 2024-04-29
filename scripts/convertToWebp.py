import os
from subprocess import call

result = [
    os.path.join(dp, f)
    for dp, dn, filenames in os.walk("./assets")
    for f in filenames
    if os.path.splitext(f)[1] in [".png", ".jpg", ".tif"] #and f.startswith("_0e7")
]

for f in result:
    new_file_name = f"{os.path.splitext(f)[0]}.webp".lower()
    new_file_name = new_file_name.replace("copy of ", "")
    new_file_name = new_file_name.replace(" copy ", "")
    new_file_name = new_file_name.replace("final_", "")
    new_file_name = new_file_name.replace("_forprint", "")
    new_file_name = new_file_name.replace(" ", "-")
    new_file_name = new_file_name.replace("_", "-")
    ret = call(["cwebp", f, "-o", new_file_name])
    if ret != 0:
        print("ERROR")
        exit(1)
    os.remove(f)

exit(0)

file_path = "src/packs/kogarashi/adventures_Kogarashi_E5MbFwGnYbaL2yYL.json"

with open(file_path, "r") as file:
    filedata = file.read()

for f in result:
    new_file_name = f"{os.path.splitext(f)[0]}.webp"
    ret = call(["cwebp", f, "-o", new_file_name])
    if ret != 0:
        print("ERROR")
        exit(1)
    os.remove(f)
    filedata = filedata.replace(f[2:], new_file_name[2:])

with open(file_path, "w") as file:
    file.write(filedata)
