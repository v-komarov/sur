# -*- coding: utf-8 -*-

def do(word):
    table = { # http://www.transcriptor.ru/transcription/russian-english/table
        'ай':'ai',
        'ей':'ei',
        'ёй':'yoi',
        'жё':'zho',
        'же':'zhe',
        'ий':'y',
        'ой':'oi',
        'уй':'ui',
        'чё':'cho',
        'шё':'sho',
        'щё':'shcho',
        'ъе':'ye',
        'ъё':'yo',
        'ъи':'yi',
        'ъо':'yo',
        'ъю':'yu',
        'ъя':'ya',
        'ый':'yi',
        'ье':'ye',
        'ьё':'yo',
        'ьи':'yi',
        'ьо':'yo',
        'ью':'yu',
        'ья':'ya',
        'эй':'ei',
        'юй':'yui',
        'яй':'yai' }

    table_b = { # ISO-9 Б
        'а':'a',
        'б':'b',
        'в':'v',
        'г':'g',
        'д':'d',
        'е':'e',
        'ё':'yo',
        'ж':'zh',
        'з':'z',
        'и':'i',
        'й':'j',
        'к':'k',
        'л':'l',
        'м':'m',
        'н':'n',
        'о':'o',
        'п':'p',
        'р':'r',
        'с':'s',
        'т':'t',
        'у':'u',
        'ф':'f',
        'х':'kh',
        'ц':'c',
        'ч':'ch',
        'ш':'sh',
        'щ':'shh',
        'ъ':'',
        'ы':'y',
        'ь':'',
        'э':'e',
        'ю':'yu',
        'я':'ya',
        ' ':'_' }

    word = word.lower()
    for key in table:
        word = word.replace(key.decode('utf-8'), table[key])
    for key in table_b:
        word = word.replace(key.decode('utf-8'), table_b[key])

    return word
