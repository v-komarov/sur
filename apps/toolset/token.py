# -*- coding: utf-8 -*-

import string
import random

def Generator(len):
    list = [random.choice(string.letters+string.digits) for x in xrange(len)]
    token = ''.join(list)
    return token