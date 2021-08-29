from django.contrib import admin

# Register your models here.
from .models import Landmark, Content, LandmarkImage

class ContentInline(admin.TabularInline):
	model = Content

class LandmarkImageInline(admin.TabularInline):
	model = LandmarkImage

class LandmarkAdmin(admin.ModelAdmin):
	fields = ['name', 'lat', 'lng', 'zIndex', 'link', 'coverImageSrc']
	list_display = ('name', 'lat', 'zIndex', 'link', 'coverImageSrc')
	inlines = [ContentInline, LandmarkImageInline]

admin.site.register(Landmark, LandmarkAdmin)