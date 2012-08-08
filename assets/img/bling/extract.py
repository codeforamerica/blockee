import os
from PIL import Image   

def iter_frames(im):
    try:
        i= 0
        while 1:
            im.seek(i)
            imframe = im.copy()
            if i == 0: 
                palette = imframe.getpalette()
            else:
                imframe.putpalette(palette)
            yield imframe
            i += 1
    except EOFError:
        pass

file_name = 'bench'
file_ext = 'gif'        

im = Image.open('%s.%s' % (file_name, file_ext))
#transparency = im.info['transparency']        

for i, frame in enumerate(iter_frames(im)):
    frame.save('output/%s%d.png' % (file_name, i), **frame.info)    
    
