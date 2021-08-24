from django.shortcuts import render
from django.core import serializers
from django.db.models import Count
from django.conf import settings
import os

from .models import Landmark, Content

# Create your views here.
class MapInfo:
    def __init__(self, center, zoom):
        self.lat = center[0]
        self.lng = center[1]
        self.zoom = zoom

def index(request):
    template_name = 'map/index.html'
    mapDisplayInfo = MapInfo(center = [38.702153249882926, -0.48110166784168], zoom = 15)
    landmarks = Landmark.objects.all()
    mapAPI = os.environ['GOOGLE_MAP_API_KEY']
    return render(request, template_name, {
        'mapAPI': mapAPI,
        'mapDisplayInfo': mapDisplayInfo,
        'landmarks': landmarks,
    })
    