import json
from decimal import Decimal
from channels.generic.websocket import WebsocketConsumer
from .models import MenuItem

class MenuItemConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        self.send_menu_items()

    def send_menu_items(self):
        menu_items = MenuItem.objects.all()
        items_data = list(menu_items.values())
        
        # Convert Decimal objects to strings
        for item in items_data:
            for key, value in item.items():
                if isinstance(value, Decimal):
                    item[key] = str(value)
        
        self.send(text_data=json.dumps(items_data))

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        self.send_menu_items()