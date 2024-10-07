from django.db import models

class Table(models.Model):
    number = models.IntegerField(unique=True)
    status = models.CharField(max_length=20, default="Available")

    def __str__(self):
        return f"Table {self.number} - {self.status}"


class MenuItem(models.Model):
    CATEGORY_CHOICES = [
        ('Food', 'Food'),
        ('Drinks', 'Drinks'),
        ('Desserts', 'Desserts'),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=6, decimal_places=2)
    available = models.BooleanField(default=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='Food')
    #image = models.ImageField(upload_to='menu_images/', null=True, blank=True)  

    def __str__(self):
        return f"{self.name} (${self.price})"

class Order(models.Model):
    table = models.ForeignKey(Table, on_delete=models.CASCADE)
    items = models.ManyToManyField(MenuItem, through='OrderItem')
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default="Pending")
    special_requests = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Order {self.id} for Table {self.table.number} - {self.status}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.menu_item.name} for Order {self.order.id}"


class Payment(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    payment_method = models.CharField(max_length=20)
    paid_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment of ${self.amount} for Order {self.order.id} by {self.payment_method}"
