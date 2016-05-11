from django.core.management.base import BaseCommand, CommandError



class Command(BaseCommand):
    args = '<ademco message ...>'
    help = 'message of officer panel'

    def handle(self, *args, **options):
        for mes in args:
            print mes


