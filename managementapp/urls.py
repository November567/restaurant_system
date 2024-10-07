from django.urls import path
from . import views

urlpatterns = [
    path('table/<int:table_id>/', views.menu_list, name='menu_list'),
    path('edit_menu_item/<int:item_id>/', views.edit_menu_item, name='edit_menu_item'),
    path('menu_management/', views.menu_management, name='menu_management'),
    path('add_product/', views.add_product, name='add_product'),
    path('kitchen/', views.kitchen_display, name='kitchen_display'),
    path('payment/<int:order_id>/', views.process_payment, name='process_payment'),
    path('reports/', views.generate_reports, name='generate_reports'),
    path('kitchen/update_status/<int:order_id>/<str:new_status>/', views.update_order_status, name='update_order_status'),
    path('api/menu_items/', views.menu_items_api, name='menu_items_api'),
    path('api/menu_items/<int:item_id>/delete/', views.delete_menu_item, name='delete_menu_item'),
    path('api/menu_items/<int:item_id>/update/', views.update_menu_item_status, name='update_menu_item_status'),
]

