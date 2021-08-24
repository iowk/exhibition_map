from django.contrib import admin

# Register your models here.
from .models import Landmark, Content

class ContentInline(admin.TabularInline):
	model = Content

class LandmarkAdmin(admin.ModelAdmin):
	fields = ['name', 'lat', 'lng', 'zIndex', 'link', 'coverImageSrc']
	list_display = ('name', 'lat', 'zIndex', 'link', 'coverImageSrc')
	inlines = [ContentInline]

admin.site.register(Landmark, LandmarkAdmin)