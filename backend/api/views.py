from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django.db.models import Sum, Count, Q, Avg
from django.db.models.functions import TruncMonth, TruncDate
from django.utils import timezone
from datetime import timedelta
import json

from .models import (User, Material, Order, OrderItem, SupplierProfile, Category, 
                     Delivery, Coupon, Notification, Wishlist, Review,
                     Message, SupportTicket, WithdrawalRequest)
from .serializers import (UserSerializer, MaterialSerializer, OrderSerializer, 
                          MyTokenObtainPairSerializer, DeliverySerializer, 
                          CouponSerializer, NotificationSerializer, WishlistSerializer,
                          ReviewSerializer, MessageSerializer, SupportTicketSerializer,
                          WithdrawalRequestSerializer, SupplierProfileSerializer)
from rest_framework_simplejwt.views import TokenObtainPairView

# ─── Custom Permissions ─────────────────────────────────────────────────────

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == 'ADMIN')

class IsSupplierUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == 'SUPPLIER')

class IsDeliveryUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == 'DELIVERY')

class IsCustomerUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == 'CUSTOMER')

# ─── Pagination ──────────────────────────────────────────────────────────────

class OrderPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50

# ─── Auth / Profile ─────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny,)

class ProfileView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        user = request.user
        if not user.check_password(old_password):
            return Response({'error': 'Incorrect current password'}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 6:
            return Response({'error': 'Password must be at least 6 characters'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password changed successfully'})

# ─── Materials ───────────────────────────────────────────────────────────────

class MaterialListCreateView(generics.ListCreateAPIView):
    serializer_class = MaterialSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        qs = Material.objects.all()
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        if category:
            qs = qs.filter(category__name__icontains=category)
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))
        return qs

    def perform_create(self, serializer):
        if self.request.user.role == 'SUPPLIER':
            mat = serializer.save(supplier=self.request.user)
            # Auto-disable if zero stock
            if mat.stock == 0:
                mat.is_active = False
                mat.save()

class MaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def perform_update(self, serializer):
        mat = serializer.save()
        # Auto-enable/disable based on stock
        mat.is_active = mat.stock > 0
        mat.save()

# ─── Orders ──────────────────────────────────────────────────────────────────

GST_RATE = 0.18  # 18% GST

def create_notification(user, title, message, notif_type, order=None):
    """Helper to create a notification"""
    Notification.objects.create(
        user=user, title=title, message=message, type=notif_type, order=order
    )

class OrderListCreateView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        if request.user.role == 'CUSTOMER':
            orders = Order.objects.filter(customer=request.user)
        elif request.user.role == 'SUPPLIER':
            materials = Material.objects.filter(supplier=request.user)
            order_ids = OrderItem.objects.filter(material__in=materials).values_list('order', flat=True)
            orders = Order.objects.filter(id__in=order_ids)
        elif request.user.role == 'ADMIN':
            orders = Order.objects.all()
        else:
            orders = Order.objects.none()

        # Filtering
        status_filter = request.query_params.get('status')
        search = request.query_params.get('search')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        if status_filter and status_filter != 'ALL':
            orders = orders.filter(status=status_filter)
        if search:
            orders = orders.filter(
                Q(id__icontains=search) |
                Q(delivery_address__icontains=search) |
                Q(items__material__name__icontains=search)
            ).distinct()
        if date_from:
            orders = orders.filter(created_at__date__gte=date_from)
        if date_to:
            orders = orders.filter(created_at__date__lte=date_to)

        orders = orders.order_by('-created_at')
        
        # Pagination
        paginator = OrderPagination()
        paginated = paginator.paginate_queryset(orders, request)
        serializer = OrderSerializer(paginated, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        if request.user.role != 'CUSTOMER':
            return Response({'error': 'Only customers can place orders'}, status=status.HTTP_403_FORBIDDEN)

        items_data = request.data.get('items', [])
        delivery_address = request.data.get('delivery_address', '')
        payment_method = request.data.get('payment_method', 'COD')
        coupon_code = request.data.get('coupon_code', '').strip().upper()

        if not items_data:
            return Response({'error': 'No items provided'}, status=status.HTTP_400_BAD_REQUEST)

        total_price = 0
        order_items_to_create = []
        for item in items_data:
            try:
                material = Material.objects.get(id=item['material_id'])
                quantity = int(item['quantity'])
                if material.stock < quantity:
                    return Response({'error': f'Insufficient stock for {material.name}'}, status=status.HTTP_400_BAD_REQUEST)
                order_items_to_create.append((material, quantity, material.price))
                total_price += float(material.price) * quantity
            except Material.DoesNotExist:
                return Response({'error': f"Material {item.get('material_id')} not found"}, status=status.HTTP_400_BAD_REQUEST)

        discount_amount = 0
        coupon_obj = None
        if coupon_code:
            try:
                coupon_obj = Coupon.objects.get(code=coupon_code)
                valid, msg = coupon_obj.is_valid()
                if not valid:
                    return Response({'error': msg}, status=status.HTTP_400_BAD_REQUEST)
                if total_price < float(coupon_obj.min_order_amount):
                    return Response({'error': f'Minimum order ₹{coupon_obj.min_order_amount} required for this coupon'}, status=status.HTTP_400_BAD_REQUEST)
                discount_amount = total_price * float(coupon_obj.discount_percent) / 100
                coupon_obj.used_count += 1
                coupon_obj.save()
            except Coupon.DoesNotExist:
                return Response({'error': 'Invalid coupon code'}, status=status.HTTP_400_BAD_REQUEST)

        price_after_discount = total_price - discount_amount
        gst_amount = price_after_discount * GST_RATE
        final_price = price_after_discount + gst_amount

        order = Order.objects.create(
            customer=request.user,
            delivery_address=delivery_address,
            total_price=round(total_price, 2),
            gst_amount=round(gst_amount, 2),
            discount_amount=round(discount_amount, 2),
            final_price=round(final_price, 2),
            payment_method=payment_method,
            coupon=coupon_obj,
        )

        for material, quantity, price in order_items_to_create:
            OrderItem.objects.create(order=order, material=material, quantity=quantity, price=price)
            material.stock -= quantity
            # Auto-disable if out of stock
            if material.stock == 0:
                material.is_active = False
                # Notify supplier
                create_notification(
                    material.supplier,
                    f"⚠️ Low Stock Alert: {material.name}",
                    f"{material.name} is now OUT OF STOCK and has been auto-disabled.",
                    'LOW_STOCK'
                )
            material.save()

        create_notification(
            request.user,
            f"Order #{order.id} Placed!",
            f"Your order for ₹{final_price:.2f} has been placed successfully.",
            'ORDER_PLACED',
            order=order
        )
        # Notify supplier(s)
        notified_suppliers = set()
        for material, _, _ in order_items_to_create:
            if material.supplier_id not in notified_suppliers:
                create_notification(
                    material.supplier,
                    f"🛒 New Order #{order.id} Received!",
                    f"A new order worth ₹{final_price:.2f} has been placed.",
                    'GENERAL',
                    order=order
                )
                notified_suppliers.add(material.supplier_id)

        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class OrderDetailView(generics.RetrieveAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_context(self):
        return {'request': self.request}


class OrderStatusUpdateView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def put(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
            role = request.user.role
            new_status = request.data.get('status')

            if role == 'SUPPLIER':
                allowed = ['ACCEPTED', 'PACKED', 'CANCELLED']
                if new_status not in allowed:
                    return Response({'error': f'Suppliers can only set: {allowed}'}, status=status.HTTP_403_FORBIDDEN)
                reason = request.data.get('reason', '')
                order.status = new_status
                if reason:
                    order.cancel_reason = reason
                order.save()
                if new_status == 'ACCEPTED':
                    delivery_person = User.objects.filter(role='DELIVERY').first()
                    Delivery.objects.update_or_create(
                        order=order,
                        defaults={
                            'delivery_person': delivery_person,
                            'status': 'ASSIGNED',
                            'pickup_address': 'Supplier Warehouse',
                            'delivery_address': order.delivery_address
                        }
                    )
                    create_notification(order.customer, f"Order #{order.id} Accepted!",
                                        "Your order has been accepted and is being prepared.", 'ORDER_ACCEPTED', order)
                elif new_status == 'PACKED':
                    create_notification(order.customer, f"Order #{order.id} Packed!",
                                        "Your order has been packed and is ready for pickup.", 'ORDER_SHIPPED', order)
                elif new_status == 'CANCELLED':
                    # Restore stock
                    for item in order.items.all():
                        if item.material:
                            item.material.stock += item.quantity
                            item.material.is_active = True
                            item.material.save()
                    create_notification(order.customer, f"Order #{order.id} Cancelled",
                                        f"Your order was cancelled by the supplier. Reason: {reason}", 'ORDER_CANCELLED', order)
                return Response({'status': order.status})

            elif role == 'ADMIN':
                valid_statuses = [s[0] for s in Order.STATUS_CHOICES]
                if new_status in valid_statuses:
                    order.status = new_status
                    order.save()
                    if new_status == 'ACCEPTED':
                        delivery_person = User.objects.filter(role='DELIVERY').first()
                        Delivery.objects.update_or_create(
                            order=order,
                            defaults={
                                'delivery_person': delivery_person,
                                'status': 'ASSIGNED',
                                'pickup_address': 'Supplier Warehouse',
                                'delivery_address': order.delivery_address
                            }
                        )
                    return Response({'status': order.status})
                return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

            else:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)


class OrderCancelView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
            if order.customer != request.user and request.user.role not in ['ADMIN', 'SUPPLIER']:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            if order.status not in ['PENDING', 'ACCEPTED']:
                return Response({'error': f'Cannot cancel order with status {order.status}'}, status=status.HTTP_400_BAD_REQUEST)
            
            reason = request.data.get('reason', 'Customer requested cancellation')
            order.status = 'CANCELLED'
            order.cancel_reason = reason
            order.save()

            for item in order.items.all():
                if item.material:
                    item.material.stock += item.quantity
                    item.material.is_active = True
                    item.material.save()
            
            if order.coupon:
                order.coupon.used_count = max(0, order.coupon.used_count - 1)
                order.coupon.save()

            create_notification(order.customer, f"Order #{order.id} Cancelled", 
                                f"Your order has been cancelled. Reason: {reason}", 'ORDER_CANCELLED', order)
            return Response({'status': 'CANCELLED', 'message': 'Order cancelled successfully'})
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)


class OrderReturnView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
            if order.customer != request.user:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            if order.status != 'DELIVERED':
                return Response({'error': 'Only delivered orders can be returned'}, status=status.HTTP_400_BAD_REQUEST)
            
            reason = request.data.get('reason', 'Customer requested return')
            order.status = 'RETURN_REQUESTED'
            order.return_reason = reason
            order.save()

            create_notification(order.customer, f"Return Requested for Order #{order.id}",
                                "Your return request has been submitted.", 'RETURN_REQUESTED', order)
            return Response({'status': 'RETURN_REQUESTED', 'message': 'Return request submitted'})
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

# ─── Coupon ──────────────────────────────────────────────────────────────────

class CouponValidateView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        order_amount = float(request.data.get('order_amount', 0))
        try:
            coupon = Coupon.objects.get(code=code)
            valid, msg = coupon.is_valid()
            if not valid:
                return Response({'valid': False, 'error': msg}, status=status.HTTP_400_BAD_REQUEST)
            if order_amount < float(coupon.min_order_amount):
                return Response({'valid': False, 'error': f'Min order ₹{coupon.min_order_amount} required'}, status=status.HTTP_400_BAD_REQUEST)
            discount = round(order_amount * float(coupon.discount_percent) / 100, 2)
            return Response({
                'valid': True, 'code': coupon.code,
                'discount_percent': float(coupon.discount_percent),
                'discount_amount': discount,
                'message': f'{coupon.discount_percent}% off applied!'
            })
        except Coupon.DoesNotExist:
            return Response({'valid': False, 'error': 'Invalid coupon code'}, status=status.HTTP_400_BAD_REQUEST)

# ─── Notifications ───────────────────────────────────────────────────────────

class NotificationListView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        notifs = Notification.objects.filter(user=request.user)
        serializer = NotificationSerializer(notifs, many=True)
        return Response({
            'notifications': serializer.data,
            'unread_count': notifs.filter(is_read=False).count()
        })

class NotificationReadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            notif = Notification.objects.get(pk=pk, user=request.user)
            notif.is_read = True
            notif.save()
            return Response({'success': True})
        except Notification.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

class NotificationReadAllView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'success': True})

# ─── Wishlist ────────────────────────────────────────────────────────────────

class WishlistView(APIView):
    permission_classes = (IsCustomerUser,)

    def get(self, request):
        items = Wishlist.objects.filter(customer=request.user).select_related('material')
        serializer = WishlistSerializer(items, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        material_id = request.data.get('material_id')
        try:
            material = Material.objects.get(pk=material_id)
            item, created = Wishlist.objects.get_or_create(customer=request.user, material=material)
            if not created:
                return Response({'message': 'Already in wishlist'})
            serializer = WishlistSerializer(item, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Material.DoesNotExist:
            return Response({'error': 'Material not found'}, status=status.HTTP_404_NOT_FOUND)

class WishlistDeleteView(APIView):
    permission_classes = (IsCustomerUser,)

    def delete(self, request, pk):
        try:
            item = Wishlist.objects.get(pk=pk, customer=request.user)
            item.delete()
            return Response({'success': True})
        except Wishlist.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

# ─── Analytics ───────────────────────────────────────────────────────────────

class AnalyticsView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        
        if user.role == 'CUSTOMER':
            orders = Order.objects.filter(customer=user)
        elif user.role == 'SUPPLIER':
            materials = Material.objects.filter(supplier=user)
            order_ids = OrderItem.objects.filter(material__in=materials).values_list('order', flat=True)
            orders = Order.objects.filter(id__in=order_ids)
        else:
            orders = Order.objects.all()

        six_months_ago = timezone.now() - timedelta(days=180)
        orders_by_month = (
            orders.filter(created_at__gte=six_months_ago)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(count=Count('id'), revenue=Sum('final_price'))
            .order_by('month')
        )
        monthly_data = [
            {
                'month': entry['month'].strftime('%b %Y'),
                'orders': entry['count'],
                'revenue': float(entry['revenue'] or 0)
            }
            for entry in orders_by_month
        ]

        status_dist = list(orders.values('status').annotate(count=Count('id')))

        top_products = (
            OrderItem.objects.filter(order__in=orders)
            .values('material__name')
            .annotate(total_qty=Sum('quantity'), total_revenue=Sum('price'))
            .order_by('-total_qty')[:5]
        )
        top_products_data = [
            {'name': p['material__name'] or 'Unknown', 'qty': p['total_qty'], 'revenue': float(p['total_revenue'] or 0)}
            for p in top_products
        ]

        spending = float(orders.filter(status='DELIVERED').aggregate(total=Sum('final_price'))['total'] or 0)
        
        return Response({
            'monthly_data': monthly_data,
            'status_distribution': status_dist,
            'top_products': top_products_data,
            'total_spent': spending,
            'total_orders': orders.count(),
        })

# ─── Supplier Views ───────────────────────────────────────────────────────────

class SupplierMaterialsView(generics.ListAPIView):
    serializer_class = MaterialSerializer
    permission_classes = (IsSupplierUser,)
    def get_queryset(self):
        return Material.objects.filter(supplier=self.request.user)

class SupplierCustomersView(APIView):
    """Returns unique customers who have placed orders with this supplier,
    so the supplier can initiate a conversation with them."""
    permission_classes = (IsSupplierUser,)

    def get(self, request):
        materials = Material.objects.filter(supplier=request.user)
        customer_ids = (
            OrderItem.objects.filter(material__in=materials)
            .values_list('order__customer', flat=True)
            .distinct()
        )
        customers = User.objects.filter(id__in=customer_ids, role='CUSTOMER')
        data = [
            {
                'user_id': c.id,
                'username': c.username,
                'avatar': c.avatar or '🧑',
                'role': c.role,
            }
            for c in customers
        ]
        return Response(data)

class SupplierOrdersView(APIView):
    permission_classes = (IsSupplierUser,)
    def get(self, request):
        materials = Material.objects.filter(supplier=request.user)
        order_ids = OrderItem.objects.filter(material__in=materials).values_list('order', flat=True)
        orders = Order.objects.filter(id__in=order_ids).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True, context={'request': request})
        return Response(serializer.data)

class SupplierAnalyticsView(APIView):
    """Rich analytics endpoint specifically for supplier dashboard"""
    permission_classes = (IsSupplierUser,)

    def get(self, request):
        materials = Material.objects.filter(supplier=request.user)
        order_ids = OrderItem.objects.filter(material__in=materials).values_list('order', flat=True)
        orders = Order.objects.filter(id__in=order_ids)

        # Daily sales for last 7 days
        seven_days_ago = timezone.now() - timedelta(days=7)
        daily_sales = (
            orders.filter(created_at__gte=seven_days_ago)
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(revenue=Sum('final_price'), count=Count('id'))
            .order_by('date')
        )

        # Monthly sales for last 6 months
        six_months_ago = timezone.now() - timedelta(days=180)
        monthly_sales = (
            orders.filter(created_at__gte=six_months_ago)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(revenue=Sum('final_price'), count=Count('id'))
            .order_by('month')
        )

        # Top selling materials (by qty)
        top_products = (
            OrderItem.objects.filter(material__in=materials, order__status__in=['ACCEPTED','PACKED','SHIPPED','DELIVERED'])
            .values('material__id', 'material__name', 'material__image')
            .annotate(total_qty=Sum('quantity'), total_revenue=Sum('price'))
            .order_by('-total_qty')[:5]
        )

        # Least performing (by qty)
        least_products = (
            OrderItem.objects.filter(material__in=materials)
            .values('material__id', 'material__name')
            .annotate(total_qty=Sum('quantity'))
            .order_by('total_qty')[:5]
        )

        # Revenue total
        total_revenue = float(orders.filter(status='DELIVERED').aggregate(t=Sum('final_price'))['t'] or 0)
        total_orders = orders.count()
        pending_orders = orders.filter(status__in=['PENDING', 'ACCEPTED', 'PACKED']).count()

        # Supplier profile
        try:
            profile = request.user.supplier_profile
            company_name = profile.company_name
            rating = profile.rating
            is_verified = profile.is_verified
        except:
            company_name = request.user.username
            rating = 0.0
            is_verified = False

        # Vendor ranking (compare revenue with other suppliers)
        all_supplier_revenues = []
        all_suppliers = User.objects.filter(role='SUPPLIER')
        for sup in all_suppliers:
            sup_materials = Material.objects.filter(supplier=sup)
            sup_order_ids = OrderItem.objects.filter(material__in=sup_materials).values_list('order', flat=True)
            rev = float(Order.objects.filter(id__in=sup_order_ids, status='DELIVERED').aggregate(t=Sum('final_price'))['t'] or 0)
            all_supplier_revenues.append({'username': sup.username, 'revenue': rev})
        all_supplier_revenues.sort(key=lambda x: x['revenue'], reverse=True)
        my_rank = next((i+1 for i, s in enumerate(all_supplier_revenues) if s['username'] == request.user.username), len(all_supplier_revenues))

        return Response({
            'daily_sales': [
                {'date': d['date'].strftime('%d %b'), 'revenue': float(d['revenue'] or 0), 'orders': d['count']}
                for d in daily_sales
            ],
            'monthly_sales': [
                {'month': m['month'].strftime('%b %Y'), 'revenue': float(m['revenue'] or 0), 'orders': m['count']}
                for m in monthly_sales
            ],
            'top_products': [
                {'id': p['material__id'], 'name': p['material__name'], 'qty': p['total_qty'], 'revenue': float(p['total_revenue'] or 0)}
                for p in top_products
            ],
            'least_products': [
                {'id': p['material__id'], 'name': p['material__name'], 'qty': p['total_qty']}
                for p in least_products
            ],
            'total_revenue': total_revenue,
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'company_name': company_name,
            'rating': rating,
            'is_verified': is_verified,
            'my_rank': my_rank,
            'total_suppliers': len(all_supplier_revenues),
            'vendor_leaderboard': all_supplier_revenues[:5],
        })

class SupplierProfileView(APIView):
    permission_classes = (IsSupplierUser,)

    def get(self, request):
        try:
            profile = request.user.supplier_profile
        except SupplierProfile.DoesNotExist:
            profile = SupplierProfile.objects.create(user=request.user, company_name=request.user.username)
        serializer = SupplierProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        try:
            profile = request.user.supplier_profile
        except SupplierProfile.DoesNotExist:
            profile = SupplierProfile.objects.create(user=request.user, company_name=request.user.username)
        serializer = SupplierProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ─── Reviews ─────────────────────────────────────────────────────────────────

class ReviewListCreateView(APIView):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get(self, request, material_id):
        reviews = Review.objects.filter(material_id=material_id).select_related('customer')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    def post(self, request, material_id):
        if request.user.role != 'CUSTOMER':
            return Response({'error': 'Only customers can review'}, status=status.HTTP_403_FORBIDDEN)
        try:
            material = Material.objects.get(pk=material_id)
        except Material.DoesNotExist:
            return Response({'error': 'Material not found'}, status=status.HTTP_404_NOT_FOUND)
        if Review.objects.filter(material=material, customer=request.user).exists():
            return Response({'error': 'You have already reviewed this product'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(material=material, customer=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReviewReplyView(APIView):
    """Supplier can reply to a review"""
    permission_classes = (IsSupplierUser,)

    def patch(self, request, pk):
        try:
            review = Review.objects.get(pk=pk, material__supplier=request.user)
            review.reply = request.data.get('reply', '')
            review.save()
            return Response(ReviewSerializer(review).data)
        except Review.DoesNotExist:
            return Response({'error': 'Review not found or access denied'}, status=status.HTTP_404_NOT_FOUND)

# ─── Messaging ────────────────────────────────────────────────────────────────

class MessageListView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        """Get all conversations (unique partners)"""
        user = request.user
        sent = Message.objects.filter(sender=user).values_list('receiver', flat=True)
        received = Message.objects.filter(receiver=user).values_list('sender', flat=True)
        partner_ids = set(list(sent) + list(received))
        partners = []
        for pid in partner_ids:
            try:
                partner = User.objects.get(pk=pid)
                last_msg = Message.objects.filter(
                    Q(sender=user, receiver=partner) | Q(sender=partner, receiver=user)
                ).last()
                unread = Message.objects.filter(sender=partner, receiver=user, is_read=False).count()
                partners.append({
                    'user_id': partner.id,
                    'username': partner.username,
                    'role': partner.role,
                    'avatar': partner.avatar,
                    'last_message': last_msg.text if last_msg else '',
                    'last_time': last_msg.timestamp.isoformat() if last_msg else None,
                    'unread': unread,
                })
            except User.DoesNotExist:
                pass
        return Response(partners)

class MessageThreadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, partner_id):
        try:
            partner = User.objects.get(pk=partner_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        messages = Message.objects.filter(
            Q(sender=request.user, receiver=partner) |
            Q(sender=partner, receiver=request.user)
        ).order_by('timestamp')
        # Mark as read
        messages.filter(receiver=request.user, is_read=False).update(is_read=True)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    def post(self, request, partner_id):
        try:
            partner = User.objects.get(pk=partner_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        text = request.data.get('text', '').strip()
        if not text:
            return Response({'error': 'Message cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)
        msg = Message.objects.create(sender=request.user, receiver=partner, text=text)
        return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)

# ─── Support Tickets ──────────────────────────────────────────────────────────

class SupportTicketView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        tickets = SupportTicket.objects.filter(user=request.user).order_by('-created_at')
        serializer = SupportTicketSerializer(tickets, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SupportTicketSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ─── Withdrawal Requests ──────────────────────────────────────────────────────

class WithdrawalRequestView(APIView):
    permission_classes = (IsSupplierUser,)

    def get(self, request):
        withdrawals = WithdrawalRequest.objects.filter(supplier=request.user).order_by('-created_at')
        serializer = WithdrawalRequestSerializer(withdrawals, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = WithdrawalRequestSerializer(data=request.data)
        if serializer.is_valid():
            wr = serializer.save(supplier=request.user)
            return Response(WithdrawalRequestSerializer(wr).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ─── Admin Views ─────────────────────────────────────────────────────────────

class AdminUsersView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (IsAdminUser,)

class AdminOrdersView(generics.ListAPIView):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer
    permission_classes = (IsAdminUser,)

    def get_serializer_context(self):
        return {'request': self.request}

class AdminSuppliersView(generics.ListAPIView):
    queryset = User.objects.filter(role='SUPPLIER')
    serializer_class = UserSerializer
    permission_classes = (IsAdminUser,)

class AdminCouponView(generics.ListCreateAPIView):
    queryset = Coupon.objects.all().order_by('-created_at')
    serializer_class = CouponSerializer
    permission_classes = (IsAdminUser,)

# ─── Delivery Views ───────────────────────────────────────────────────────────

class DeliveryListView(generics.ListAPIView):
    serializer_class = DeliverySerializer
    permission_classes = (IsDeliveryUser,)
    def get_queryset(self):
        return Delivery.objects.filter(delivery_person=self.request.user)

class DeliveryStatusUpdateView(APIView):
    permission_classes = (IsDeliveryUser,)
    def put(self, request, pk):
        try:
            delivery = Delivery.objects.get(pk=pk, delivery_person=request.user)
            new_status = request.data.get('status')
            if new_status in dict(Delivery.STATUS_CHOICES):
                delivery.status = new_status
                delivery.save()
                if new_status == 'DELIVERED':
                    delivery.order.status = 'DELIVERED'
                    delivery.order.payment_status = 'COMPLETED'
                    delivery.order.save()
                    create_notification(
                        delivery.order.customer,
                        f"Order #{delivery.order.id} Delivered! 🎉",
                        "Your order has been delivered successfully.",
                        'ORDER_DELIVERED',
                        order=delivery.order
                    )
                    # Notify supplier payment received
                    items = delivery.order.items.all()
                    notified = set()
                    for item in items:
                        if item.material and item.material.supplier_id not in notified:
                            create_notification(
                                item.material.supplier,
                                f"💳 Payment Received for Order #{delivery.order.id}",
                                f"₹{delivery.order.final_price} has been credited for order #{delivery.order.id}.",
                                'PAYMENT_RECEIVED',
                                order=delivery.order
                            )
                            notified.add(item.material.supplier_id)
                elif new_status == 'ON_THE_WAY':
                    delivery.order.status = 'SHIPPED'
                    delivery.order.save()
                    create_notification(
                        delivery.order.customer,
                        f"Order #{delivery.order.id} is On The Way! 🚚",
                        "Your order is out for delivery.",
                        'ORDER_SHIPPED',
                        order=delivery.order
                    )
                return Response({'status': delivery.status})
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        except Delivery.DoesNotExist:
            return Response({'error': 'Delivery not found'}, status=status.HTTP_404_NOT_FOUND)
