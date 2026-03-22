from api.models import Category, User, Material
from django.core.management.base import BaseCommand
from decimal import Decimal

class Command(BaseCommand):
    help = 'Seed initial data for BuildMart'

    def handle(self, *args, **kwargs):
        # Create Categories
        categories = ['Cement', 'Steel', 'Sand', 'Bricks', 'Aggregates', 'Tools']
        cat_objs = {}
        for name in categories:
            obj, created = Category.objects.get_or_create(name=name)
            cat_objs[name] = obj
            if created:
                self.stdout.write(f'Created category: {name}')

        # Create an Admin
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@buildmart.com', 'admin123', role='ADMIN')
            self.stdout.write('Created superuser: admin (pass: admin123)')

        # Create a Sample Supplier
        supplier, created = User.objects.get_or_create(username='supplier1', email='supplier@test.com', role='SUPPLIER')
        if created:
            supplier.set_password('supplier123')
            supplier.save()
            self.stdout.write('Created supplier: supplier1 (pass: supplier123)')

        # Create a Sample Delivery Person
        delivery, created = User.objects.get_or_create(username='delivery1', email='delivery@test.com', role='DELIVERY')
        if created:
            delivery.set_password('delivery123')
            delivery.save()
            self.stdout.write('Created delivery: delivery1 (pass: delivery123)')

        # Create Sample Materials
        materials_data = [
            {'name': 'UltraTech OPC 53 Grade Cement', 'category': 'Cement', 'price': 450.00, 'stock': 500, 'desc': 'High strength cement for all construction needs.'},
            {'name': 'TATA Tiscon TMT Bar 12mm', 'category': 'Steel', 'price': 75.00, 'stock': 1000, 'desc': 'Corrosion resistant high quality steel bars.'},
            {'name': 'M-Sand (Cubic Feet)', 'category': 'Sand', 'price': 60.00, 'stock': 2000, 'desc': 'Manufactured sand for superior masonry work.'},
            {'name': 'Wire Cut Red Bricks', 'category': 'Bricks', 'price': 12.00, 'stock': 5000, 'desc': 'Uniform size and high durability red bricks.'},
        ]

        for m in materials_data:
            if not Material.objects.filter(name=m['name']).exists():
                Material.objects.create(
                    name=m['name'],
                    category=cat_objs[m['category']],
                    price=Decimal(m['price']),
                    stock=m['stock'],
                    supplier=supplier,
                    description=m['desc']
                )
                self.stdout.write(f"Created material: {m['name']}")
