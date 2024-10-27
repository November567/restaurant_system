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
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.forms import AuthenticationForm
from django.db.models import Sum, F, FloatField, ExpressionWrapper, DurationField, Avg
from django.templatetags.static import static
from django.contrib import messages
from django.contrib.auth.models import User
from .forms import MenuItemForm
import json


def menu_list(request, table_id, order_id=None):
    table = get_object_or_404(Table, pk=table_id)
    if table.status == "Unavailable":
        return render(request, "managementapp/error_menu.html", {"error_message": "This table is unavailable."})

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
                total_price = request.POST.get("total_price", 0)
                size = request.POST.get("size", "")

                order = current_order or Order.objects.create(
                        table=table, status="Pending"
                    )
                if quantity == 0:
                    if not order.orderitem_set.exists():  
                        order.delete()  
                        redirect_url = reverse("menu_list", kwargs={"table_id": table.id})  
                    else:
                        redirect_url = reverse("menu_list", kwargs={"table_id": table.id, "order_id": order.id})
                else:
                    OrderItem.objects.create(
                            order=order,
                            menu_item=menu_item,
                            special_requests=special_requests,
                            quantity=quantity,
                            size=size,
                            total_price=total_price,
                        )


                    redirect_url = reverse(
                            "menu_list", kwargs={"table_id": table.id, "order_id": order.id}
                        )

                return JsonResponse({"success": True, "redirect_url": redirect_url})


        return render(
            request,
            "managementapp/food_detail.html",
            {
                "menu_item": menu_item,
                "table": table,
                "current_order": current_order,
                "current_order_item": current_order_item,
                "quantity": current_order_item.quantity if current_order_item else 1,
                "special_requests": (
                    current_order_item.special_requests if current_order_item else ""
                ),
                "size": current_order_item.size if current_order_item else "S",
            },
        )
    except Exception as e:
        # Log the error for debugging
        import logging

        logging.error(f"Error in food_order view: {str(e)}")

        # Return a JSON response with error details
        return JsonResponse({"success": False, "error": str(e)}, status=500)


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
                form.add_error("image", "Please upload an image.")
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
    #pending_orders = Order.objects.filter(status="Pending")
    #pending_orders.update(status="In Progress")
    in_progress_orders = Order.objects.filter(status="In Progress")


    orders = {
        "in_progress": in_progress_orders,
    }

    return render(request, "managementapp/kitchen.html", {"orders": orders})


@login_required
def completed_kitchen_display(request):
    completed_orders = Order.objects.filter(status="Completed")
    orders = {
        "completed": completed_orders,
    }

    return render(request, "managementapp/completed_kitchen.html", {"orders": orders})


@csrf_exempt
def complete_order(request, order_id):
    if request.method == "POST":
        try:
            order = Order.objects.get(id=order_id)
            order.status = "Completed"
            order.completed_at = timezone.now()
            order.save()
            return JsonResponse({"success": True})
        except Order.DoesNotExist:
            return JsonResponse({"success": False, "error": "Order not found."})
    return JsonResponse({"success": False, "error": "Invalid request method."})


def get_order_details(request, order_id):
    order = get_object_or_404(Order, id=order_id)

    order_items = order.orderitem_set.all()

    context = {
        "order": order,
        "order_items": order_items,
    }

    return render(request, "managementapp/order_detail.html", context)


def process_payment(request, order_id):
    order = get_object_or_404(Order, pk=order_id)
    if request.method == "POST":
        payment_method = request.POST.get("payment_method")
        amount = sum(item.total_price for item in order.orderitem_set.all())

        Payment.objects.create(
            order=order,
            amount=amount,
            payment_method=payment_method,
            paid_at=timezone.now()
        )

        order.status = "In Progress"
        order.created_at = timezone.now()
        order.save()

        return redirect("menu_list", table_id=order.table.id)

    return render(request, "managementapp/payment.html", {"order": order})


@login_required
def dashboard(request):
    tables = Table.objects.all()
    menu_items = MenuItem.objects.all()
    orders = Order.objects.all()
    payments = Payment.objects.all()

    context = {
        "tables": tables,
        "menu_items": menu_items,
        "orders": orders,
        "payments": payments,
    }
    return render(request, "managementapp/dashboard.html", context)


def user_logout(request):
    logout(request)
    return redirect("login")


def user_login(request):
    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get("username")
            password = form.cleaned_data.get("password")
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect("kitchen_display")
            else:
                messages.error(request, "Invalid credentials")
        else:
            messages.error(request, "Invalid credentials")
    return render(request, "managementapp/login.html")


def user_register(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        confirm_password = request.POST.get("confirmPassword")
        email = request.POST.get("email")

        if not username or not password or not confirm_password or not email:
            messages.error(request, "All fields are required")
            return render(request, "managementapp/register.html")

        if password != confirm_password:
            messages.error(request, "Passwords do not match")
            return render(request, "managementapp/register.html")

        if User.objects.filter(username=username).exists():
            messages.error(request, "Username is already taken")
            return render(request, "managementapp/register.html")

        if User.objects.filter(email=email).exists():
            messages.error(request, "Email is already registered")
            return render(request, "managementapp/register.html")

        user = User.objects.create_user(
            username=username, password=password, email=email
        )
        user.save()

        messages.success(request, "Account created successfully")
        return redirect("login")

    return render(request, "managementapp/register.html")

def format_duration(duration):
    """Convert ISO 8601 duration to hh:mm:ss format."""
    total_seconds = duration.total_seconds()
    hours, remainder = divmod(total_seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f'{int(hours):02}:{int(minutes):02}:{int(seconds):02}'


def dashboard(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        # Get the period filter from the query string (e.g., 'today', 'week', 'month')
        period = request.GET.get("period", "today")

        # Filter orders based on the selected period
        if period == "today":
            start_date = timezone.now().replace(hour=0, minute=0, second=0)
        elif period == "week":
            start_date = timezone.now() - timezone.timedelta(days=7)
        elif period == "month":
            start_date = timezone.now().replace(day=1)
        else:
            start_date = None

        # Filter orders and payments based on the period
        orders = (
            Order.objects.filter(created_at__gte=start_date, status="Completed")
            if start_date
            else Order.objects.all()
        )
        payments = Payment.objects.filter(order__in=orders)
        print(payments)

        # Calculate total orders, total revenue, and average order value
        total_orders = orders.count()
        total_revenue = payments.aggregate(total=Sum("amount"))["total"] or 0
        avg_order_value = round(total_revenue / total_orders, 2) if total_orders else 0
        preparation_time_data = orders.annotate(
            preparation_time=ExpressionWrapper(
                F("completed_at") - F("created_at"), output_field=DurationField()
            )
        ).aggregate(avg_preparation_time=Avg("preparation_time"))

        avg_preparation_time = preparation_time_data['avg_preparation_time']
        if avg_preparation_time:
            avg_preparation_time = format_duration(avg_preparation_time)  # Convert to hh:mm:ss
        else:
            avg_preparation_time = 'N/A'

        # Revenue data over time
        revenue_data = (
            Payment.objects.annotate(date=F("paid_at__date"))
            .values("date")
            .annotate(revenue=Sum("amount", output_field=FloatField()))
            .order_by("date")
        )

        # Top-selling items
        top_selling_items = (
            OrderItem.objects.filter(order__in=orders)
            .values("menu_item__name", "menu_item__image")
            .annotate(sold=Sum("quantity"))
            .order_by("-sold")[:5]
        )

        # Prepare data for the frontend
        dashboard_data = {
            "totalOrders": total_orders,
            "totalRevenue": total_revenue,
            "preparation_time_data": avg_preparation_time,
            "revenueData": list(revenue_data),
        }

        top_selling = [
            {
                "name": item["menu_item__name"],
                "sold": item["sold"],
                "image": item["menu_item__image"],
            }
            for item in top_selling_items
        ]

        # Return JSON response
        return JsonResponse(
            {"dashboardData": dashboard_data, "topSellingItems": top_selling}
        )
    return render(request, 'managementapp/dashboard.html')

@require_http_methods(["GET", "POST"])
def edit_food_order(request, item_id, table_id, order_id, order_item_id):
    try:
        menu_item = get_object_or_404(MenuItem, pk=item_id)
        table = get_object_or_404(Table, pk=table_id)
        current_order = get_object_or_404(Order, pk=order_id)
        current_order_item = get_object_or_404(OrderItem, pk=order_item_id)

        if request.method == "POST":
            with transaction.atomic():
                try:
                    quantity = int(request.POST.get("quantity", 1))
                    special_requests = request.POST.get("special_requests", "")
                    total_price = float(request.POST.get("total_price", 0))
                    size = request.POST.get("size", "")  
                    print(quantity)
                    if quantity == 0:
                        current_order_item.delete()
                        if not current_order.orderitem_set.exists():  
                            current_order.delete()  
                            redirect_url = reverse("menu_list", kwargs={"table_id": table.id}) 
                        else:
                            redirect_url = reverse("process_payment", kwargs={"order_id": current_order.id})
                    else:
                        current_order_item.quantity = quantity
                        current_order_item.special_requests = special_requests
                        current_order_item.size = size
                        current_order_item.total_price = total_price
                        current_order_item.save()
    
                        redirect_url = reverse("process_payment", kwargs={"order_id": current_order.id})
                    return JsonResponse({"success": True, "redirect_url": redirect_url})
                
                except Exception as e:
                    return JsonResponse({"success": False, "error": str(e)})


        return render(
            request,
            "managementapp/edit_food_detail.html",
            {
                "menu_item": menu_item,
                "table": table,
                "current_order": current_order,
                "current_order_item": current_order_item,
                "quantity": current_order_item.quantity if current_order_item else 1,
                "special_requests": (
                    current_order_item.special_requests if current_order_item else ""
                ),
                "size": current_order_item.size if current_order_item else "S",
            },
        )
    except Exception as e:
        # Log the error for debugging
        import logging

        logging.error(f"Error in food_order view: {str(e)}")

        # Return a JSON response with error details
        return JsonResponse({"success": False, "error": str(e)}, status=500)
