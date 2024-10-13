from django.shortcuts import render, get_object_or_404
from .models import Table, MenuItem, Order, Payment
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.db.models import Sum, Count, Avg
from django.shortcuts import render, get_object_or_404, redirect
from .models import Table, MenuItem, Order, OrderItem
from .forms import MenuItemForm
import json


def menu_list(request, table_id):
    table = get_object_or_404(Table, pk=table_id)

    # Get all menu items and organize them by category
    menu_items = MenuItem.objects.filter(available=True)
    categories = {
        "Recommend": menu_items.filter(category="Recommend"),
        "Food": menu_items.filter(category="Food"),
        "Appetizer": menu_items.filter(category="Appetizer"),
        "Drink": menu_items.filter(category="Drink"),
        "Dessert": menu_items.filter(category="Dessert"),
    }

    return render(
        request,
        "managementapp/menu_list.html",
        {"table": table, "categories": categories},
    )


def food_order(request, item_id, table_id):
    # Retrieve the menu item based on the provided item_id
    menu_item = get_object_or_404(MenuItem, pk=item_id)
    table = get_object_or_404(Table, pk=table_id)

    if request.method == "POST":
        # Get the quantity and special requests from the form
        quantity = int(request.POST.get("quantity", 1))  # Default quantity is 1
        special_requests = request.POST.get("special_requests", "")

        # Create an OrderItem instance
        order = Order.objects.create(table=table, status="Pending")

        # Create an OrderItem instance and associate it with the Order
        order_item = OrderItem.objects.create(
            order=order,  # Associate OrderItem with the Order
            menu_item=menu_item,
            special_requests=special_requests,
            quantity=quantity,
        )  # Associate the MenuItem with the Order through OrderItem

        # Redirect to a confirmation page or another view
        return redirect("menu_list", table_id=table.id)

    return render(
        request,
        "managementapp/food_detail.html",
        {"menu_item": menu_item, "table": table},
    )


@login_required
def menu_items_api(request):
    if request.method == "GET":
        menu_items = MenuItem.objects.all()
        items_data = [
            {
                "id": item.id,
                "name": item.name,
                "category": item.category,
                "price": str(item.price),
                "status": item.available,
                "image": str(item.image),
            }
            for item in menu_items
        ]
        return JsonResponse(items_data, safe=False)


@login_required
def menu_management(request):
    menu_items = MenuItem.objects.all()  # Fetch all menu items
    context = {
        "menu_items": menu_items,  # Pass the menu items to the template
    }
    return render(request, "managementapp/menu_management.html", context)


@login_required
def add_product(request):
    if request.method == "POST":
        form = MenuItemForm(request.POST, request.FILES)
        if form.is_valid():
            # ตรวจสอบว่ามีการอัปโหลดรูปภาพหรือไม่
            if form.cleaned_data["image"]:  # ตรวจสอบว่ามีไฟล์หรือไม่
                form.save()
                return redirect("menu_management")  # เปลี่ยนเส้นทางหลังจากบันทึก
            else:
                form.add_error(
                    "image", "Please upload an image."
                )  # Redirect after saving
        else:
            print(form.errors)
    else:
        form = MenuItemForm()

    context = {
        "form": form,
    }
    return render(request, "managementapp/add_product.html", context)


@login_required
def edit_product(request, item_id):
    print(f"Editing item with ID: {item_id}")  # Debug print
    menu_item = get_object_or_404(MenuItem, id=item_id)

    if request.method == "POST":
        print("Received POST request")  # Debug print
        form = MenuItemForm(request.POST, request.FILES, instance=menu_item)
        if form.is_valid():
            print("Form is valid, saving...")  # Debug print
            form.save()
            return redirect("menu_management")
        else:
            print(form.errors)
    else:
        print("Displaying edit form")  # Debug print
        form = MenuItemForm(instance=menu_item)

    context = {
        "form": form,
        "item_id": item_id,
    }
    return render(request, "managementapp/edit_product.html", context)


@require_http_methods(["DELETE"])
def delete_menu_item(request, item_id):
    try:
        # Find the menu item by its ID
        menu_item = MenuItem.objects.get(pk=item_id)
        # Delete the menu item
        menu_item.delete()
        return JsonResponse({"message": "Item deleted successfully"}, status=200)
    except MenuItem.DoesNotExist:
        # If the item does not exist, return a 404 error
        return JsonResponse({"error": "Item not found"}, status=404)
    except Exception as e:
        # Handle any other errors
        return JsonResponse({"error": str(e)}, status=500)


@require_http_methods(["PATCH"])
def update_menu_item_status(request, item_id):
    try:
        data = json.loads(request.body)
        available = data.get("available", None)

        menu_item = MenuItem.objects.get(pk=item_id)

        if available is not None:
            # Update the available field of the menu item
            menu_item.available = available
            menu_item.save()

            return JsonResponse(
                {"message": "Availability updated successfully"}, status=200
            )
        else:
            return JsonResponse({"error": "Availability not provided"}, status=400)

    except MenuItem.DoesNotExist:
        return JsonResponse({"error": "Item not found"}, status=404)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@login_required
def kitchen_display(request):
    orders = Order.objects.filter(status="Pending")
    return render(request, "managementapp/kitchen.html", {"orders": orders})


def process_payment(request, order_id):
    order = get_object_or_404(Order, pk=order_id)

    if request.method == "POST":
        # Example: Handle the payment (you might want to integrate a payment gateway)
        payment_method = request.POST.get('payment_method')  # Assume this is passed from the form
        amount = sum(item.menu_item.price * item.quantity for item in order.orderitem_set.all())

        # Create a payment record
        Payment.objects.create(
            order=order,
            amount=amount,
            payment_method=payment_method,
        )

        # Update order status
        order.status = 'Completed'
        order.save()

        return redirect('payment_confirmation')  # Redirect to a confirmation page after payment

    return render(request, "managementapp/process_payment.html", {"order": order})



def generate_reports(request):
    # Generate reports and analytics
    return render(request, "managementapp/reports.html")


# orders/views.py


def update_order_status(request, order_id, new_status):
    order = get_object_or_404(Order, pk=order_id)
    if new_status in ["Pending", "In Progress", "Completed"]:
        order.status = new_status
        order.save()
    return redirect("kitchen_display")
