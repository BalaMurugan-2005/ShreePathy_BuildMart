from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (User, CustomerProfile, SupplierProfile, Category, Material, 
                     Order, OrderItem, Delivery, Review, Coupon, Notification, Wishlist,
                     Message, SupportTicket, WithdrawalRequest)

class DeliverySerializer(serializers.ModelSerializer):
    delivery_person_name = serializers.CharField(source='delivery_person.username', read_only=True)
    class Meta:
        model = Delivery
        fields = '__all__'

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        token['email'] = user.email
        return token

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role', 'phone', 'avatar', 'first_name', 'last_name')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        if user.role == 'CUSTOMER':
            CustomerProfile.objects.create(user=user)
        elif user.role == 'SUPPLIER':
            SupplierProfile.objects.create(user=user, company_name=user.username)
        return user

    def update(self, instance, validated_data):
        validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class SupplierProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = SupplierProfile
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class MaterialSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.username', read_only=True)
    category = serializers.SlugRelatedField(slug_field='name', queryset=Category.objects.all(), required=False, allow_null=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    wishlist_count = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Material
        fields = '__all__'
        extra_kwargs = {
            'supplier': {'read_only': True},
        }

    def get_wishlist_count(self, obj):
        return obj.wishlisted_by.count()

    def get_avg_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews.exists():
            return round(sum(r.rating for r in reviews) / reviews.count(), 1)
        return 0

    def get_review_count(self, obj):
        return obj.reviews.count()

    def to_internal_value(self, data):
        if 'category' in data and data['category'] and not Category.objects.filter(name=data['category']).exists():
            Category.objects.create(name=data['category'])
        return super().to_internal_value(data)

class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.username', read_only=True)
    customer_avatar = serializers.CharField(source='customer.avatar', read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'material', 'customer', 'customer_name', 'customer_avatar', 'rating', 'comment', 'reply', 'created_at')
        extra_kwargs = {
            'customer': {'read_only': True},
            'material': {'read_only': True},
        }

class OrderItemSerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(source='material.name', read_only=True)
    material_image = serializers.SerializerMethodField()
    material_id = serializers.IntegerField(source='material.id', read_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ('id', 'material', 'material_id', 'material_name', 'material_image', 'quantity', 'price', 'subtotal')

    def get_material_image(self, obj):
        if obj.material and obj.material.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.material.image.url)
        return None

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ('id', 'code', 'discount_percent', 'min_order_amount', 'is_active', 'expiry_date')

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.username', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    delivery = DeliverySerializer(read_only=True)
    coupon_code = serializers.CharField(source='coupon.code', read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        extra_kwargs = {
            'customer': {'read_only': True},
            'total_price': {'read_only': True},
            'gst_amount': {'read_only': True},
            'final_price': {'read_only': True},
            'discount_amount': {'read_only': True},
        }

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class WishlistSerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(source='material.name', read_only=True)
    material_price = serializers.DecimalField(source='material.price', max_digits=10, decimal_places=2, read_only=True)
    material_stock = serializers.IntegerField(source='material.stock', read_only=True)
    material_image = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = '__all__'
        extra_kwargs = {'customer': {'read_only': True}}

    def get_material_image(self, obj):
        if obj.material and obj.material.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.material.image.url)
        return None

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    sender_avatar = serializers.CharField(source='sender.avatar', read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'sender', 'sender_name', 'sender_avatar', 'receiver', 'order', 'text', 'timestamp', 'is_read')
        extra_kwargs = {'sender': {'read_only': True}}

class SupportTicketSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = SupportTicket
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}

class WithdrawalRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = WithdrawalRequest
        fields = '__all__'
        extra_kwargs = {'supplier': {'read_only': True}}
