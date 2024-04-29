import os
from subprocess import call

result = [
    os.path.join(dp, f)
    for dp, dn, filenames in os.walk("./assets")
    for f in filenames
    #if os.path.splitext(f)[1] in [".png", ".jpg", ".tif"] #and f.startswith("_0e7")
]

for f in result:
    new_file_name = f.lower()
    new_file_name = new_file_name.replace(" color", "")
    new_file_name = new_file_name.replace("_edit", "")
    new_file_name = new_file_name.replace(" ", "-")
    new_file_name = new_file_name.replace("_", "-")
    
    os.rename(f, new_file_name)

exit(0)
