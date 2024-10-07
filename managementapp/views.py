from django.shortcuts import render, get_object_or_404
from .models import Table, MenuItem, Order, Payment
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Sum, Count, Avg
from django.shortcuts import render, get_object_or_404, redirect
from .models import Table, MenuItem, Order, OrderItem
from .forms import MenuItemForm
import json

def menu_list(request, table_id):
    table = get_object_or_404(Table, pk=table_id)
    menu_items = MenuItem.objects.filter(available=True)
    
    if request.method == 'POST':
        selected_items = request.POST.getlist('items')
        special_requests = request.POST.get('special_requests', '')
        
        # Create an order
        order = Order(table=table, special_requests=special_requests)
        order.save()
        
        # Add selected menu items to the order
        for item_id in selected_items:
            item = MenuItem.objects.get(pk=item_id)
            OrderItem.objects.create(order=order, item=item)
        
        # Redirect to a confirmation page or another view
        return redirect('order_confirmation', order_id=order.id)
    
    return render(request, 'managementapp/menu_list.html', {'table': table, 'menu_items': menu_items})


def menu_items_api(request):
    if request.method == 'GET':
        menu_items = MenuItem.objects.all()
        items_data = [
            {
                'id': item.id,
                'name': item.name,
                'category': item.category,
                'price': str(item.price),  # Convert Decimal to String for JSON
                'status': item.available,
            }
            for item in menu_items
        ]
        return JsonResponse(items_data, safe=False)
    
def get_menu_items(request):
    menu_items = MenuItem.objects.all()
    items_data = list(menu_items.values())  # Convert queryset to a list of dictionaries
    return JsonResponse(items_data, safe=False)
    
@login_required
def menu_management(request):
    menu_items = MenuItem.objects.all()  # Fetch all menu items
    context = {
        'menu_items': menu_items,  # Pass the menu items to the template
    }
    return render(request, 'managementapp/menu_management.html', context)

@login_required
def add_product(request):
    if request.method == 'POST':
        form = MenuItemForm(request.POST)  # Capture form data
        if form.is_valid():
            form.save()  # Save the new product to the MenuItem model
            return redirect('menu_management')  # Redirect after saving
    else:
        form = MenuItemForm()

    context = {
        'form': form,
    }
    return render(request, 'managementapp/add_product.html', context)

@login_required
def edit_menu_item(request, item_id):
    print(f"Editing item with ID: {item_id}")  # Debug print
    menu_item = get_object_or_404(MenuItem, id=item_id)

    if request.method == 'POST':
        print("Received POST request")  # Debug print
        form = MenuItemForm(request.POST, instance=menu_item)
        if form.is_valid():
            print("Form is valid, saving...")  # Debug print
            form.save()
            return redirect('menu_management')
    else:
        print("Displaying edit form")  # Debug print
        form = MenuItemForm(instance=menu_item)

    context = {
        'form': form,
        'item_id': item_id,
    }
    return render(request, 'managementapp/edit_menu_item.html', context)


@require_http_methods(["DELETE"])
def delete_menu_item(request, item_id):
    try:
        # Find the menu item by its ID
        menu_item = MenuItem.objects.get(pk=item_id)
        # Delete the menu item
        menu_item.delete()
        return JsonResponse({'message': 'Item deleted successfully'}, status=200)
    except MenuItem.DoesNotExist:
        # If the item does not exist, return a 404 error
        return JsonResponse({'error': 'Item not found'}, status=404)
    except Exception as e:
        # Handle any other errors
        return JsonResponse({'error': str(e)}, status=500)
    
@require_http_methods(["PATCH"])
def update_menu_item_status(request, item_id):
    try:
        data = json.loads(request.body)
        available = data.get('available', None)

        menu_item = MenuItem.objects.get(pk=item_id)

        if available is not None:
            # Update the available field of the menu item
            menu_item.available = available
            menu_item.save()

            return JsonResponse({'message': 'Availability updated successfully'}, status=200)
        else:
            return JsonResponse({'error': 'Availability not provided'}, status=400)

    except MenuItem.DoesNotExist:
        return JsonResponse({'error': 'Item not found'}, status=404)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def kitchen_display(request):
    orders = Order.objects.filter(status='Pending')
    return render(request, 'managementapp/kitchen_display.html', {'orders': orders})

def process_payment(request, order_id):
    order = get_object_or_404(Order, pk=order_id)
    if request.method == 'POST':
        # Handle payment
        pass
    return render(request, 'managementapp/process_payment.html', {'order': order})

def generate_reports(request):
    # Generate reports and analytics
    return render(request, 'managementapp/reports.html')
# orders/views.py

def update_order_status(request, order_id, new_status):
    order = get_object_or_404(Order, pk=order_id)
    if new_status in ["Pending", "In Progress", "Completed"]:
        order.status = new_status
        order.save()
    return redirect('kitchen_display')

def generate_reports(request):
    # Sales Reporting
    total_revenue = Payment.objects.aggregate(total=Sum('amount'))['total'] or 0
    popular_items = MenuItem.objects.annotate(quantity=Count('orderitem')).order_by('-quantity')[:5]
    
    # Example sales over time (daily)
    sales_over_time_data = Payment.objects.extra({'day': "date(created_at)"}).values('day').annotate(total=Sum('amount')).order_by('day')
    sales_over_time = {
        'labels': [item['day'].strftime('%Y-%m-%d') for item in sales_over_time_data],
        'data': [float(item['total']) for item in sales_over_time_data],
    }

    # Performance Metrics
    avg_prep_time = Order.objects.filter(status='Completed').aggregate(avg_prep=Avg('created_at'))['avg_prep'] or 0
    table_turnover_rate = Table.objects.filter(order__status='Completed').count() / 10  # Example calculation
    staff_efficiency = 85  # Placeholder value

    context = {
        'sales_report': {
            'total_revenue': total_revenue,
            'popular_items': popular_items,
            'sales_over_time': sales_over_time,
        },
        'performance_metrics': {
            'avg_prep_time': avg_prep_time,
            'table_turnover_rate': table_turnover_rate,
            'staff_efficiency': staff_efficiency,
        }
    }
    return render(request, 'managementapp/reports.html', context)

# Example Django view