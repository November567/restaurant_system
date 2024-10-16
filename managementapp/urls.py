from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('table/<int:table_id>/', views.menu_list, name='menu_list'),
    path('table/<int:table_id>/order/<int:order_id>/', views.menu_list, name='menu_list'),
    path('table/<int:table_id>/menu_item/<int:item_id>/', views.food_order, name='food_detail'),
    path('table/<int:table_id>/menu_item/<int:item_id>/order/<int:order_id>/', views.food_order, name='food_detail'),
    path('table/<int:table_id>/menu_item/<int:item_id>/order/<int:order_id>/order_id/<int:order_item_id>/', views.food_order, name='food_detail'),
    path('edit_product/<int:item_id>/', views.edit_product, name='edit_product'),
    path('menu_management/', views.menu_management, name='menu_management'),
    path('add_product/', views.add_product, name='add_product'),
    path('payment/order/<int:order_id>/', views.process_payment, name='process_payment'),
    path('kitchen/in_progress/', views.kitchen_display, name='kitchen_display'),
    path('kitchen/completed/', views.completed_kitchen_display, name='completed_kitchen_display'),
    path('reports/', views.generate_reports, name='generate_reports'),
    path('api/menu_items/', views.menu_items_api, name='menu_items_api'),
    path('api/menu_items/<int:item_id>/delete/', views.delete_menu_item, name='delete_menu_item'),
    path('api/menu_items/<int:item_id>/update/', views.update_menu_item_status, name='update_menu_item_status'),
    path('get-order-details/<int:order_id>/', views.get_order_details, name='get_order_details'),
    path('api/orders/<int:order_id>/complete/', views.complete_order, name='complete_order'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

