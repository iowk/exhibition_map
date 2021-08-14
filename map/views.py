from django.shortcuts import render
from django.views import View
from django.http import HttpResponse
import os
import json

# Create your views here.
class MapInfo:
    def __init__(self, center, zoom):
        self.centerx = center[0]
        self.centery = center[1]
        self.zoom = zoom

def index(request):
    template_name = 'map/index.html'
    mapDisplayInfo = MapInfo(center = [38.702153249882926, -0.48110166784168], zoom = 15)
    mapMarkers = json.dumps([
        ["Flat", 38.70247799333973, -0.4810848766401825, 1, 3],
        ["CADA", 38.6957128003002, -0.4748468463366204, 1, 12],
    ]) #name, lat, lng, zIndex, expoCount
    mapAPI = os.environ['GOOGLE_MAP_API_KEY']
    return render(request, template_name, {'mapAPI': mapAPI, 'mapDisplayInfo': mapDisplayInfo, 'mapMarkers': mapMarkers,})
    
