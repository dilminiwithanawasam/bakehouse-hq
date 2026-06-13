"""
Core management command for database seeding.
Populates all tables completely with realistic Sri Lankan bakery data.
"""

import random
from datetime import date, timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.models import User
from apps.products.models import (
    ProductCategory, Product, Outlet, ProductBatch,
    DispatchRequest, Dispatch, StockAdjustment
)
from apps.sales.models import Sale, SaleItem, Order, Payment
from apps.wastage.models import Wastage


class Command(BaseCommand):
    help = 'Seed initial data for development'

    def handle(self, *args, **options):
        self.stdout.write('Starting data seeding...')

        # Clean existing data to prevent duplicate keys and integrity errors
        self.stdout.write('Cleaning existing data...')
        Payment.objects.all().delete()
        Order.objects.all().delete()
        SaleItem.objects.all().delete()
        Sale.objects.all().delete()
        Wastage.objects.all().delete()
        Dispatch.objects.all().delete()
        DispatchRequest.objects.all().delete()
        ProductBatch.objects.all().delete()
        StockAdjustment.objects.all().delete()
        Outlet.objects.all().delete()
        Product.objects.all().delete()
        ProductCategory.objects.all().delete()

        # Keep standard users, delete others
        User.objects.exclude(email__in=['admin@bakery.com', 'manager@bakery.com', 'sales@bakery.com']).delete()

        # Create users
        self.stdout.write('Creating users...')
        users = [
            {
                'email': 'admin@bakery.com',
                'name': 'Aarav Mehta',
                'role': 'admin',
                'password': 'demo1234',
            },
            {
                'email': 'manager@bakery.com',
                'name': 'Priya Sharma',
                'role': 'manager',
                'password': 'demo1234',
            },
            {
                'email': 'sales@bakery.com',
                'name': 'Rohan Patel',
                'role': 'salesperson',
                'password': 'demo1234',
            },
        ]
        
        user_objects = {}
        for user_data in users:
            password = user_data.pop('password')
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults=user_data,
            )
            if created:
                user.set_password(password)
                user.save()
                self.stdout.write(f"  Created user: {user.email}")
            else:
                self.stdout.write(f"  User already exists: {user.email}")
            user_objects[user.email] = user
        
        admin_user = user_objects['admin@bakery.com']
        manager_user = user_objects['manager@bakery.com']
        sales_user = user_objects['sales@bakery.com']

        # Create product categories
        self.stdout.write('Creating product categories...')
        categories = [
            {'name': 'Bread', 'display_order': 1, 'description': 'Freshly baked local loaves and buns.'},
            {'name': 'Pastry', 'display_order': 2, 'description': 'Sweet and savory puff pastries.'},
            {'name': 'Cake', 'display_order': 3, 'description': 'Celebration cakes and single slices.'},
            {'name': 'Beverage', 'display_order': 4, 'description': 'Cold brews and traditional hot teas.'},
        ]
        
        category_map = {}
        for cat_data in categories:
            cat, created = ProductCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'display_order': cat_data['display_order'],
                    'description': cat_data['description']
                },
            )
            category_map[cat.name] = cat
            self.stdout.write(f"  Processed category: {cat.name}")
        
        # Create products
        self.stdout.write('Creating products...')
        products_data = [
            {'name': 'Sourdough Loaf', 'category': 'Bread', 'price': 450, 'stock': 24, 'min_stock': 10, 'shelf_life_days': 3},
            {'name': 'Croissant', 'category': 'Pastry', 'price': 220, 'stock': 38, 'min_stock': 15, 'shelf_life_days': 2},
            {'name': 'Chocolate Muffin', 'category': 'Pastry', 'price': 180, 'stock': 15, 'min_stock': 12, 'shelf_life_days': 2},
            {'name': 'Blueberry Cheesecake', 'category': 'Cake', 'price': 950, 'stock': 8, 'min_stock': 5, 'shelf_life_days': 3},
            {'name': 'Garlic Baguette', 'category': 'Bread', 'price': 350, 'stock': 18, 'min_stock': 10, 'shelf_life_days': 2},
            {'name': 'Almond Danish', 'category': 'Pastry', 'price': 240, 'stock': 22, 'min_stock': 12, 'shelf_life_days': 2},
            {'name': 'Tiramisu Slice', 'category': 'Cake', 'price': 650, 'stock': 9, 'min_stock': 6, 'shelf_life_days': 3},
            {'name': 'Whole Wheat Bun', 'category': 'Bread', 'price': 90, 'stock': 60, 'min_stock': 25, 'shelf_life_days': 2},
            {'name': 'Cinnamon Roll', 'category': 'Pastry', 'price': 280, 'stock': 14, 'min_stock': 10, 'shelf_life_days': 2},
            {'name': 'Red Velvet Cupcake', 'category': 'Cake', 'price': 250, 'stock': 12, 'min_stock': 8, 'shelf_life_days': 3},
            {'name': 'Cold Brew Coffee', 'category': 'Beverage', 'price': 480, 'stock': 30, 'min_stock': 12, 'shelf_life_days': 5},
            {'name': 'Masala Chai', 'category': 'Beverage', 'price': 150, 'stock': 25, 'min_stock': 10, 'shelf_life_days': 1},
        ]
        
        product_objects = []
        for prod_data in products_data:
            category_name = prod_data.pop('category')
            product = Product.objects.create(
                name=prod_data['name'],
                category=category_map[category_name],
                price=Decimal(str(prod_data['price'])),
                stock=prod_data['stock'],
                min_stock=prod_data['min_stock'],
                shelf_life_days=prod_data['shelf_life_days'],
                measurement_type='units',
                max_stock_limit=150,
                is_active=True
            )
            product_objects.append(product)
            self.stdout.write(f"  Created product: {product.name}")

        # Create Outlets
        self.stdout.write('Creating outlets...')
        outlets_data = [
            {'name': 'Colombo Fort Store', 'code': 'COL-FORT', 'location': 'York Street, Colombo 01'},
            {'name': 'Galle Road Store', 'code': 'GAL-ROAD', 'location': 'Galle Road, Colombo 03'},
            {'name': 'Kandy Central Store', 'code': 'KAN-CENT', 'location': 'Dalada Vidiya, Kandy'},
        ]
        
        outlet_objects = []
        for out_data in outlets_data:
            outlet = Outlet.objects.create(
                name=out_data['name'],
                code=out_data['code'],
                location=out_data['location'],
                is_active=True
            )
            outlet_objects.append(outlet)
            self.stdout.write(f"  Created outlet: {outlet.name}")

        # Create Product Batches for FIFO stock management
        self.stdout.write('Creating batches for products...')
        batch_objects = {}
        for idx, product in enumerate(product_objects):
            # Create two batches for each product
            for batch_idx in range(1, 3):
                batch_number = f"B-{product.name[:4].upper()}-{idx:02d}-{batch_idx}"
                qty_produced = product.stock // 2 + 10
                current_qty = product.stock // 2
                
                batch = ProductBatch.objects.create(
                    product=product,
                    batch_number=batch_number,
                    production_date=date.today() - timedelta(days=batch_idx),
                    quantity_produced=qty_produced,
                    current_quantity=current_qty,
                    outlet_assignment=outlet_objects[idx % len(outlet_objects)],
                    is_active=True
                )
                
                # Cache the first batch for each product to link to sales/wastage
                if product.id not in batch_objects:
                    batch_objects[product.id] = batch
                
                self.stdout.write(f"    Batch {batch.batch_number} created for {product.name}")

        # Create Historical Sales (14 Days of Data for dashboard charts)
        self.stdout.write('Seeding historical sales data...')
        payment_methods = ['cash', 'card', 'online']
        
        for day_offset in range(13, -1, -1):
            sale_date = date.today() - timedelta(days=day_offset)
            
            # Generate 2 to 5 sales per day
            num_sales = random.randint(2, 5)
            for s_idx in range(num_sales):
                cashier = random.choice([manager_user, sales_user])
                
                # Pick 1 to 4 random products for this sale
                sale_products = random.sample(product_objects, random.randint(1, 4))
                
                # Temporary containers to calculate subtotal
                sale_items_temp = []
                subtotal = Decimal('0.00')
                
                for product in sale_products:
                    qty = random.randint(1, 3)
                    price = product.price
                    discount = Decimal('0.00')
                    
                    # 10% chance of a discount
                    if random.random() < 0.1:
                        discount = Decimal(str(random.randint(10, 50)))
                        
                    line_tot = (Decimal(qty) * price) - discount
                    subtotal += line_tot
                    
                    sale_items_temp.append({
                        'product': product,
                        'quantity': qty,
                        'unit_price': price,
                        'discount_amount': discount,
                        'batch': batch_objects.get(product.id)
                    })
                
                tax = subtotal * Decimal('0.08') # 8% tax
                total = subtotal + tax
                
                # Custom unique reference number to prevent timestamp collisions
                ref_number = f"SAL-{sale_date.strftime('%Y%m%d')}-{day_offset:02d}-{s_idx:02d}-{random.randint(1000, 9999)}"
                
                # Save the sale
                sale = Sale.objects.create(
                    date=sale_date,
                    reference_number=ref_number,
                    cashier=cashier,
                    subtotal=subtotal,
                    tax_amount=tax,
                    discount_amount=Decimal('0.00'),
                    total=total,
                    payment_method=random.choice(payment_methods),
                    is_void=False,
                    created_by=cashier
                )
                
                # Save sale items
                for item_data in sale_items_temp:
                    SaleItem.objects.create(
                        sale=sale,
                        product=item_data['product'],
                        batch=item_data['batch'],
                        quantity=item_data['quantity'],
                        unit_price=item_data['unit_price'],
                        discount_amount=item_data['discount_amount']
                    )
                    
                    # Update product metrics
                    product = item_data['product']
                    product.total_sold += item_data['quantity']
                    product.save(update_fields=['total_sold'])
                    
            self.stdout.write(f"  Seeded {num_sales} sales for {sale_date}")

        # Create Wastage logs
        self.stdout.write('Seeding wastage records...')
        reasons = ['expired', 'damaged', 'quality_issue', 'overproduction']
        
        # Select 6 random products to have wastage events
        wasted_products = random.sample(product_objects, 6)
        for idx, product in enumerate(wasted_products):
            w_date = date.today() - timedelta(days=random.randint(1, 10))
            qty = random.randint(1, 5)
            unit_cost = product.price * Decimal('0.60') # cost price is 60% of retail
            
            # Explicit unique reference number to prevent collisions
            ref_number = f"WAS-{w_date.strftime('%Y%m%d')}-{idx:02d}-{random.randint(1000, 9999)}"
            
            wastage = Wastage.objects.create(
                date=w_date,
                reference_number=ref_number,
                product=product,
                batch=batch_objects.get(product.id),
                quantity=qty,
                reason=random.choice(reasons),
                unit_cost=unit_cost,
                recorded_by=manager_user,
                notes=f"Found during daily stock counting audit.",
                is_approved=random.choice([True, False])
            )
            
            if wastage.is_approved:
                wastage.approved_by = admin_user
                wastage.approved_at = timezone.now()
                wastage.save()
                
            self.stdout.write(f"  Recorded wastage for: {product.name} (Qty: {qty})")

        # Create Custom celebration Cake Orders
        self.stdout.write('Seeding advanced orders and payments...')
        customers = [
            {'name': 'Kamal Wijesinghe', 'phone': '0771234567', 'email': 'kamal@gmail.com'},
            {'name': 'Dilini Fernando', 'phone': '0719876543', 'email': 'dilini@yahoo.com'},
            {'name': 'Suresh Perera', 'phone': '0765554433', 'email': 'suresh@hotmail.com'},
            {'name': 'Minoli Silva', 'phone': '0721112222', 'email': 'minoli@gmail.com'},
            {'name': 'Amara Gunawardena', 'phone': '0754443322', 'email': 'amara@live.com'},
        ]
        
        order_statuses = ['pending', 'packed', 'ready', 'completed', 'cancelled']
        
        for idx, customer in enumerate(customers):
            status = order_statuses[idx % len(order_statuses)]
            order_total = Decimal(str(random.randint(1500, 8500)))
            
            # Explicit unique reference number
            ref_number = f"ORD-{date.today().strftime('%Y%m%d')}-{idx:02d}-{random.randint(1000, 9999)}"
            
            order = Order.objects.create(
                reference_number=ref_number,
                customer_name=customer['name'],
                customer_email=customer['email'],
                customer_phone=customer['phone'],
                pickup_date=date.today() + timedelta(days=random.randint(1, 7)),
                status=status,
                total=order_total,
                notes=f"Custom celebration request. Preferred messaging via phone."
            )
            
            # Create advance payment for orders
            Payment.objects.create(
                order=order,
                amount=order_total * Decimal('0.50'), # 50% deposit paid
                payment_method=random.choice(payment_methods),
                reference_number=f"PAY-REG-{random.randint(10000, 99999)}"
            )
            
            self.stdout.write(f"  Created advanced order for: {order.customer_name} (Status: {order.status})")

        # Create Supply Chain Dispatches
        self.stdout.write('Seeding supply chain dispatches...')
        
        # Create 3 dispatch requests
        req_1 = DispatchRequest.objects.create(
            outlet=outlet_objects[0],
            product=product_objects[0],
            quantity_requested=15,
            status='completed',
            notes="Need urgent stock for weekend crowd."
        )
        req_2 = DispatchRequest.objects.create(
            outlet=outlet_objects[1],
            product=product_objects[1],
            quantity_requested=25,
            status='approved',
            notes="Standard stock replenishment request."
        )
        req_3 = DispatchRequest.objects.create(
            outlet=outlet_objects[2],
            product=product_objects[2],
            quantity_requested=20,
            status='pending',
            notes="Running low on chocolate variants."
        )
        
        # Create dispatches for the approved/completed requests
        Dispatch.objects.create(
            request=req_1,
            outlet=outlet_objects[0],
            batch=batch_objects.get(product_objects[0].id),
            quantity_dispatched=15,
            driver_name="Saman Silva",
            status='delivered'
        )
        
        Dispatch.objects.create(
            request=req_2,
            outlet=outlet_objects[1],
            batch=batch_objects.get(product_objects[1].id),
            quantity_dispatched=25,
            driver_name="Nimal Perera",
            status='en_route'
        )
        
        self.stdout.write(f"  Seeded supply chain request and dispatch queues")

        self.stdout.write(self.style.SUCCESS('All system tables seeded successfully!'))
