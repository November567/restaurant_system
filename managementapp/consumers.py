import json
from decimal import Decimal
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import MenuItem

class MenuItemConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.send_menu_items()

    async def send_menu_items(self):
        # Fetch menu items asynchronously
        menu_items = await self.get_menu_items()
        items_data = list(menu_items)

        # Convert Decimal objects to strings
        for item in items_data:
            for key, value in item.items():
                if isinstance(value, Decimal):
                    item[key] = str(value)

        # Send the serialized data
        await self.send(text_data=json.dumps(items_data))

    @sync_to_async
    def get_menu_items(self):
        # ORM call wrapped in sync_to_async
        return list(MenuItem.objects.values())  # ORM operations remain synchronous

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        await self.send_menu_items()
