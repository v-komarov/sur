# coding: utf-8

import json

from apps.settings_local import ROOT_URL
from apps.settings import MEDIA_ROOT
from apps.toolset.explorer.cmd import Commands

class Do(Commands):

    def index(self):
        self.result = None

    def execute(self, action, request):
    #request.GET, post=request.POST, files=request.FILES

        if action == 'index':
            self.data['media_root'] = ROOT_URL+'media'#MEDIA_URL
            self.data['tree'] = self.tree()
            self.data['open'] = self.open('/')

        elif action == 'tree':
            self.data = self.tree()

        elif action == 'open':
            self.data = self.open(request.GET['path'])

        elif action == 'mkdir':
            self.data['test'] = request.POST['name']
            path = self.mkdir(request.POST)
            self.data['tree'] = self.tree()
            self.data['open'] = self.open(path)

        elif action == 'remove':
            path = self.remove(request.POST)
            self.data['tree'] = self.tree()
            self.data['open'] = self.open(path)

        elif action == 'upload':
            self.data['answer'] = self.upload(request)

        elif action == 'get_info':
            path = self.root_path+request.POST['path']
            self.data['time'] = self.get_time(path)
            self.data['size'] = self.get_size(path)

        return json.dumps(self.data)#, ensure_ascii=False)

