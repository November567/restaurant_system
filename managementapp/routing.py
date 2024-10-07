from django.urls import re_path
from . import consumers  # We'll create this next

websocket_urlpatterns = [
    re_path(r'ws/menu_items/$', consumers.MenuItemConsumer.as_asgi()),
]