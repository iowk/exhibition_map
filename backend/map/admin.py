from django.contrib import admin

# Register your models here.
from .models import CustomUser, Landmark, Content, LandmarkImage, LandmarkComment, ContentImage, ContentComment

class UserAdmin(admin.ModelAdmin):
	fields = ['username', 'email', 'password', 'is_staff', 'is_verified']
	list_display = ['username', 'email', 'password', 'is_staff', 'is_verified']

class ContentInline(admin.TabularInline):
	model = Content

class LandmarkImageInline(admin.TabularInline):
	model = LandmarkImage

class LandmarkCommentInline(admin.TabularInline):
	model = LandmarkComment

class LandmarkAdmin(admin.ModelAdmin):
	fields = ['name', 'owner', 'lat', 'lng', 'zIndex', 'link', 'coverImageSrc', 'is_visible']
	list_display = ['name', 'owner', 'lat', 'lng', 'zIndex', 'link', 'coverImageSrc', 'is_visible']
	inlines = [ContentInline, LandmarkImageInline, LandmarkCommentInline]

class ContentImageInline(admin.TabularInline):
	model = ContentImage

class ContentCommentInline(admin.TabularInline):
	model = ContentComment

class ContentAdmin(admin.ModelAdmin):
	fields = ['landmark', 'owner','name', 'startDate', 'endDate', 'link', 'description', 'coverImageSrc', 'is_visible']
	list_display = ['landmark', 'owner', 'name', 'startDate', 'endDate', 'link', 'description', 'coverImageSrc', 'is_visible']
	inlines = [ContentImageInline, ContentCommentInline]

admin.site.register(Landmark, LandmarkAdmin)
admin.site.register(Content, ContentAdmin)
admin.site.register(CustomUser, UserAdmin)