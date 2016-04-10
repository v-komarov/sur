from datetime import datetime
import os
import shutil
import hashlib
import mimetypes as mimes
import time
import re

from apps.settings import MEDIA_ROOT

class Commands(object):
    ''' The base command abstract class '''
    def __init__(self):
        self.root_path = MEDIA_ROOT
        self.list = []

        self.result = {}
        self.data = {}
        self.dirs = []
        self.files = []
        self.errors = []

    def tree(self):
        cnt = 0
        for item in os.walk(self.root_path):
            if item[1]:
                path = item[0].replace(self.root_path,'').replace('\\','/')
                path += '/'
                self.result[cnt] = {
                    'path': path,
                    'sub': sorted(item[1]),
                }
                cnt += 1
        return self.result

    def mkdir(self, post):
        path = (self.root_path+post['path']+'/'+post['name'])#.encode('utf-8')
        #path = path.replace('/','\\') #   ---   ---   ---   !!! for windows !!!
        os.makedirs(path, mode=0o777)
        return post['path']

    def remove(self, post):
        path = self.root_path+post['path']+'/'+post['name']
        if path != self.root_path:
            #path = path.replace('/','\\') #   ---   ---   ---   !!! for windows !!!
            if post['type'] == 'dir':
                shutil.rmtree(path)
            else:
                os.remove(path)
            return post['path']

    def upload(self, request):
        #path = path.replace('/','\\') #   ---   ---   ---   for windows !!!
        if request.FILES:
            for file in request.FILES.getlist('file'):
                path = self.root_path + request.POST['path'] + file.name
                self.list.append(file.name)
                dest = open(path.encode('utf-8'), 'wb+')
                if file.multiple_chunks:
                    for c in file.chunks():
                        dest.write(c)
                else:
                    dest.write(file.read())
                dest.close()
        else:
            self.list.append('no files')
        return self.list

    def open(self, path):
        full_path = self.root_path + path
        for i in os.listdir(full_path):
            if os.path.isfile( os.path.join(full_path,i) ):
                self.files.append({
                    'name': i,
                    'size': os.path.getsize(full_path+i),
                    'type': mimes.guess_type(full_path+i)[0],
                })
            else:
                self.dirs.append({
                    'name': i,
                })
        self.result = {
            'path': path,
            'size': self.get_size(full_path),
            'time': self.get_time(full_path),
            'dirs': self.dirs,
            'files': self.files,
            'full_path': self.root_path + path
            }
        return self.result


    def get_time(self, path):
        ftime = time.gmtime( round(os.path.getmtime(path)) )
        return time.strftime('%Y-%m-%d %H-%M-%S', ftime)

    def get_size(self, path, size=0):
        if os.path.isfile( path ):
            size = os.path.getsize( path )
        else:
            for in_folder in os.listdir( path ):
                in_folder_item = os.path.join( path,in_folder )
                if os.path.isfile( in_folder_item ):
                    size += os.path.getsize( in_folder_item )
                else:
                    self.get_size( in_folder_item, size )
        return size