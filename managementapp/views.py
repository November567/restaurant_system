from django.shortcuts import render, get_object_or_404, redirect
from .models import Table, MenuItem, Order, Payment
from django.http import JsonResponse
from django.urls import reverse
from django.db import transaction
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .models import Table, MenuItem, Order, OrderItem
from .forms import MenuItemForm
import json


def menu_list(request, table_id, order_id=None):
    table = get_object_or_404(Table, pk=table_id)
    
    menu_items = MenuItem.objects.filter(available=True)
    categories = {
        "Recommend": menu_items.filter(recommend=True),
        "Food": menu_items.filter(category="Food"),
        "Appetizer": menu_items.filter(category="Appetizer"),
        "Drink": menu_items.filter(category="Drink"),
        "Dessert": menu_items.filter(category="Dessert"),
    }
    
    current_order = None
    if order_id:
        current_order = get_object_or_404(Order, pk=order_id)
    
    return render(
        request,
        "managementapp/menu_list.html",
        {"table": table, "categories": categories, "current_order": current_order},
    )


@require_http_methods(["GET", "POST"])
def food_order(request, item_id, table_id, order_id=None, order_item_id=None):
    try:
        menu_item = get_object_or_404(MenuItem, pk=item_id)
        table = get_object_or_404(Table, pk=table_id)
        current_order = None
        current_order_item = None
        
        if order_id:
            current_order = get_object_or_404(Order, pk=order_id)
        
        if order_item_id:
            current_order_item = get_object_or_404(OrderItem, pk=order_item_id)

        if request.method == "POST":
            with transaction.atomic():
                quantity = int(request.POST.get("quantity", 1))
                special_requests = request.POST.get("special_requests", "")
                total_price = request.POST.get('total_price', 0)
                size = request.POST.get("size", "")

                order = current_order or Order.objects.create(table=table, status="Pending")

                if current_order_item:
                    current_order_item.quantity = quantity
                    current_order_item.special_requests = special_requests
                    current_order_item.size = size
                    current_order_item.total_price = total_price 
                    current_order_item.save()
                else:
                    OrderItem.objects.create(
                        order=order,  
                        menu_item=menu_item,
                        special_requests=special_requests,
                        quantity=quantity,
                        size=size,
                        total_price = total_price 
                    )

                from_payment = request.POST.get('from_payment', 'false')
                
                if from_payment == 'true':
                    redirect_url = reverse('payment_page', kwargs={'order_id': order.id})
                else:
                    redirect_url = reverse('menu_list', kwargs={'table_id': table.id, 'order_id': order.id})

                return JsonResponse({
                    'success': True,
                    'redirect_url': redirect_url
                })

        from_payment = request.GET.get('from_payment', 'false')

        return render(
            request,
            "managementapp/food_detail.html",
            {
                "menu_item": menu_item, 
                "table": table, 
                "current_order": current_order, 
                "current_order_item": current_order_item, 
                "from_payment": from_payment,
                "quantity": current_order_item.quantity if current_order_item else 1, 
                "special_requests": current_order_item.special_requests if current_order_item else "", 
                "size": current_order_item.size if current_order_item else "S",  
            }
        )
    except Exception as e:
        # Log the error for debugging
        import logging
        logging.error(f"Error in food_order view: {str(e)}")
        
        # Return a JSON response with error details
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

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
    menu_items = MenuItem.objects.all() 
    context = {
        "menu_items": menu_items, 
    }
    return render(request, "managementapp/menu_management.html", context)


@login_required
def add_product(request):
    if request.method == "POST":
        form = MenuItemForm(request.POST, request.FILES)
        if form.is_valid():
            if form.cleaned_data["image"]: 
                form.save()
                return redirect("menu_management") 
            else:
                form.add_error(
                    "image", "Please upload an image."
                )
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
        menu_item = MenuItem.objects.get(pk=item_id)
        menu_item.delete()
        return JsonResponse({"message": "Item deleted successfully"}, status=200)
    except MenuItem.DoesNotExist:
        return JsonResponse({"error": "Item not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@require_http_methods(["PATCH"])
def update_menu_item_status(request, item_id):
    try:
        data = json.loads(request.body)
        available = data.get("available", None)

        menu_item = MenuItem.objects.get(pk=item_id)

        if available is not None:

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
    pending_orders = Order.objects.filter(status="Pending")
    in_progress_orders = Order.objects.filter(status="In Progress")

    pending_orders.update(status="In Progress")

    orders = {
        'in_progress': in_progress_orders,
    }

    return render(request, "managementapp/kitchen.html", {"orders": orders})

@login_required
def completed_kitchen_display(request):
    completed_orders = Order.objects.filter(status="Completed")
    orders = {
        'completed': completed_orders,
    }

    return render(request, "managementapp/completed_kitchen.html", {"orders": orders})


@csrf_exempt  
def complete_order(request, order_id):
    if request.method == 'POST':
        try:
            order = Order.objects.get(id=order_id)
            order.status = "Completed"
            order.completed_at = timezone.now()
            order.save()
            return JsonResponse({'success': True})
        except Order.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Order not found.'})
    return JsonResponse({'success': False, 'error': 'Invalid request method.'})

def get_order_details(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
        data = {
            "id": order.id,
            "table": order.table.id,
            "status": order.status,
            "created_at": order.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "items": [
                {"name": item.menu_item.name, "quantity": item.quantity}
                for item in order.orderitem_set.all()
            ]
        }
        return JsonResponse(data)
    except Order.DoesNotExist:
        return JsonResponse({"error": "Order not found"}, status=404)

def process_payment(request, order_id):
    order = get_object_or_404(Order, pk=order_id)
    if request.method == "POST":
        payment_method = request.POST.get('payment_method')  
        amount = sum(item.total_price for item in order.orderitem_set.all())

        Payment.objects.create(
            order=order,
            amount=amount,
            payment_method=payment_method,
        )

        order.status = 'Pending'
        order.created_at = timezone.now()
        order.save()

        return redirect('menu_list', table_id=order.table.id)  

    return render(request, "managementapp/payment.html", {"order": order})

@login_required
def dashboard(request):
    tables = Table.objects.all()
    menu_items = MenuItem.objects.all()
    orders = Order.objects.all()
    payments = Payment.objects.all()

    context = {
        'tables': tables,
        'menu_items': menu_items,
        'orders': orders,
        'payments': payments,
    }
    return render(request, 'managementapp/dashboard.html', context)
