from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, MyTokenObtainPairView, ProfileView, ChangePasswordView,
    MaterialListCreateView, MaterialDetailView,
    OrderListCreateView, OrderDetailView, OrderStatusUpdateView,
    OrderCancelView, OrderReturnView,
    SupplierMaterialsView, SupplierOrdersView, SupplierAnalyticsView, SupplierProfileView, SupplierCustomersView,
    AdminUsersView, AdminOrdersView, AdminSuppliersView, AdminCouponView,
    DeliveryListView, DeliveryStatusUpdateView,
    CouponValidateView, NotificationListView, NotificationReadView, NotificationReadAllView,
    WishlistView, WishlistDeleteView, AnalyticsView,
    ReviewListCreateView, ReviewReplyView,
    MessageListView, MessageThreadView,
    SupportTicketView, WithdrawalRequestView,
)

urlpatterns = [
    # Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/change-password/', ChangePasswordView.as_view(), name='change-password'),

    # Materials
    path('materials/', MaterialListCreateView.as_view(), name='material-list'),
    path('materials/<int:pk>/', MaterialDetailView.as_view(), name='material-detail'),

    # Reviews
    path('materials/<int:material_id>/reviews/', ReviewListCreateView.as_view(), name='review-list'),
    path('reviews/<int:pk>/reply/', ReviewReplyView.as_view(), name='review-reply'),

    # Orders
    path('orders/', OrderListCreateView.as_view(), name='order-list'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('orders/<int:pk>/status/', OrderStatusUpdateView.as_view(), name='order-status'),
    path('orders/<int:pk>/cancel/', OrderCancelView.as_view(), name='order-cancel'),
    path('orders/<int:pk>/return/', OrderReturnView.as_view(), name='order-return'),

    # Coupons
    path('coupons/validate/', CouponValidateView.as_view(), name='coupon-validate'),

    # Notifications
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('notifications/<int:pk>/read/', NotificationReadView.as_view(), name='notification-read'),
    path('notifications/read-all/', NotificationReadAllView.as_view(), name='notification-read-all'),

    # Wishlist
    path('wishlist/', WishlistView.as_view(), name='wishlist'),
    path('wishlist/<int:pk>/', WishlistDeleteView.as_view(), name='wishlist-delete'),

    # Analytics (customer)
    path('analytics/', AnalyticsView.as_view(), name='analytics'),

    # Supplier
    path('supplier/materials/', SupplierMaterialsView.as_view(), name='supplier-materials'),
    path('supplier/orders/', SupplierOrdersView.as_view(), name='supplier-orders'),
    path('supplier/analytics/', SupplierAnalyticsView.as_view(), name='supplier-analytics'),
    path('supplier/profile/', SupplierProfileView.as_view(), name='supplier-profile'),
    path('supplier/customers/', SupplierCustomersView.as_view(), name='supplier-customers'),

    # Messaging
    path('messages/', MessageListView.as_view(), name='message-list'),
    path('messages/<int:partner_id>/', MessageThreadView.as_view(), name='message-thread'),

    # Support
    path('support/', SupportTicketView.as_view(), name='support-tickets'),

    # Withdrawals
    path('withdrawals/', WithdrawalRequestView.as_view(), name='withdrawals'),

    # Admin
    path('admin/users/', AdminUsersView.as_view(), name='admin-users'),
    path('admin/orders/', AdminOrdersView.as_view(), name='admin-orders'),
    path('admin/suppliers/', AdminSuppliersView.as_view(), name='admin-suppliers'),
    path('admin/coupons/', AdminCouponView.as_view(), name='admin-coupons'),
    
    # Delivery
    path('delivery/', DeliveryListView.as_view(), name='delivery-list'),
    path('delivery/<int:pk>/status/', DeliveryStatusUpdateView.as_view(), name='delivery-status-update'),
]
