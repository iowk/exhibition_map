from django.contrib import admin

# Register your models here.
from .models import Landmark, Content, LandmarkImage, CustomUser

class ContentInline(admin.TabularInline):
	model = Content

class LandmarkImageInline(admin.TabularInline):
	model = LandmarkImage

class LandmarkAdmin(admin.ModelAdmin):
	fields = ['name', 'lat', 'lng', 'zIndex', 'link', 'coverImageSrc']
	list_display = ('name', 'lat', 'lng', 'zIndex', 'link', 'coverImageSrc')
	inlines = [ContentInline, LandmarkImageInline]

class UserAdmin(admin.ModelAdmin):
	fields = ['username', 'email', 'password', 'is_staff', 'is_verified']
	list_display = ['username', 'email', 'password', 'is_staff', 'is_verified']

admin.site.register(Landmark, LandmarkAdmin)
admin.site.register(CustomUser, UserAdmin)