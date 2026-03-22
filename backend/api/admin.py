from django.contrib import admin
from .models import User, CustomerProfile, SupplierProfile, Category, Material, Order, OrderItem, Delivery, Review

admin.site.register(User)
admin.site.register(CustomerProfile)
admin.site.register(SupplierProfile)
admin.site.register(Category)
admin.site.register(Material)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Delivery)
admin.site.register(Review)
