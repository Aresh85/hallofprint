# 🖨️ Print Shop Order Management Dashboard - Feature Plan

## 📋 Overview
Professional order management system for Hall of Print with complete workflow tracking, Stripe integration, and comprehensive notes system.

---

## 🚀 Phase 1: Database Migration (DO FIRST!)

Run `enhance-orders-table.sql` in Supabase to add:

### New Order Columns:
- `operator_notes` - Internal notes (not visible to customer)
- `customer_notes` - Notes added by customer on their orders
- `operator_customer_notes` - Notes about the customer (e.g., "prefers rush orders", "always pays late")
- `stripe_payment_intent_id` - Link to Stripe payment
- `stripe_payment_status` - Real-time Stripe status
- `production_status` - Workflow status (not_started, design, printing, finishing, quality_check, ready, dispatched)
- `priority` - normal, high, urgent
- `due_date` - Deadline for completion
- `assigned_to` - Which operator is handling this
- `proof_approved` - Has customer approved the proof?
- `proof_url` - Link to proof PDF/image
- `artwork_received` - Has artwork been received?
- `artwork_url` - Link to artwork files

### New Tables:
- `order_sundries` - Additional charges (setup fees, rush fees, extra work)
- `order_activity_log` - Complete audit trail of all changes

---

## 🎨 Phase 2: Enhanced Dashboard Features

### A. Order Status Management

**Order Status (for customer-facing):**
- pending
- processing
- completed
- cancelled

**Production Status (internal workflow):**
- not_started
- design_in_progress
- awaiting_proof_approval
- approved_for_production
- printing
- finishing (cutting, binding, laminating)
- quality_check
- ready_for_dispatch
- dispatched
- delivered

**Payment Status (Stripe-linked):**
- pending
- authorized
- paid
- failed
- refunded
- partially_refunded

### B. Priority System

**Priority Levels:**
- Normal (green)
- High (orange) 
- Urgent (red/flashing)

**Visual Indicators:**
- Color-coded badges
- Due date countdown
- Overdue warnings

### C. Notes System (3 Types)

**1. Operator Notes** (🔒 Internal Only)
- Only visible to operators/admins
- For internal communication
- Example: "Customer called about rush delivery"
- Timestamp & author tracking

**2. Customer Notes** (👤 Customer-Facing)
- Added by customer on their order
- Visible to operators
- Example: "Please use recycled paper"
- Can be edited by customer before production starts

**3. Operator Customer Notes** (📝 About the Customer)
- Persistent notes about the customer (not order-specific)
- Example: "Prefers email communication", "Regular bulk orders"
- Visible across all customer's orders
- Helps build customer relationship

### D. Sundries/Additional Charges

**Examples:**
- Setup fee: £25.00
- Rush fee: £50.00
- Design amendments: £15.00
- Extra finishing work: £30.00
- Delivery surcharge: £10.00

**Features:**
- Add multiple sundries per order
- Auto-calculate new total
- Add description
- Track who added it and when
- Update Stripe payment if needed

### E. Artwork & Proofs

**Artwork Management:**
- Upload artwork files
- Mark as "artwork received"
- Link to cloud storage (Dropbox, Google Drive)
- File format validation

**Proof Approval:**
- Upload proof PDF/image
- Send to customer for approval
- Track approval status
- Date/time of approval
- Email notification on approval

### F. Assignment & Workload

**Assign Orders:**
- Assign to specific operator
- View operator workload
- Filter orders by assigned operator
- Reassign if needed

**Operator Dashboard:**
- "My Orders" view
- Prioritized task list
- Due date alerts

### G. Stripe Payment Integration

**Features:**
- Display real-time payment status from Stripe
- Link to Stripe dashboard
- Payment intent ID
- Refund directly from dashboard
- Payment history
- Send payment reminder emails

### H. Activity Log / Audit Trail

**Track Everything:**
- Status changes (who, when, what)
- Notes added
- Sundries added
- Payment updates
- Assignments
- Proof approvals
- File uploads

**Display:**
- Timeline view
- Filter by activity type
- Search activity log
- Export audit trail

### I. Advanced Filters & Search

**Filter By:**
- Status (order status, production status, payment status)
- Priority
- Date range
- Due date
- Assigned operator
- Customer
- Payment method
- Amount range

**Search:**
- Order number
- Customer name/email
- Product name
- Notes content

### J. Quick Actions

**Bulk Operations:**
- Update status for multiple orders
- Assign multiple orders
- Export selected orders
- Print packing slips
- Send batch notifications

**Single Order Actions:**
- Quick status update
- Add note (with templates)
- Upload file
- Send email to customer
- Print invoice/packing slip
- Copy order
- Duplicate for repeat order

### K. Dashboard Widgets

**Summary Cards:**
- Orders needing attention (overdue, awaiting approval)
- Today's production schedule
- Unpaid orders
- Urgent orders
- Revenue this week/month
- Operator workload

**Charts:**
- Orders by status (pie chart)
- Revenue timeline
- Top products
- Customer repeat rate

---

## 📊 Phase 3: Customer View Updates

### Customer Order Page Enhancements:

**Show to Customer:**
- Order status (simplified)
- Estimated completion date
- Proof for approval (if available)
- Ability to add/edit customer notes
- Payment status
- Tracking information
- Invoice download

**Hide from Customer:**
- Operator notes
- Operator customer notes
- Production status details
- Assignment info
- Sundries breakdown (show as "Additional Services")
- Internal activity log

---

## 🔔 Phase 4: Notifications & Automation

### Email Notifications:

**To Customer:**
- Order confirmed
- Payment received
- Proof ready for approval
- Production started
- Order ready for collection/dispatch
- Order dispatched (with tracking)
- Order delivered

**To Operators:**
- New order received
- Order assigned to you
- Proof approved
- Payment received
- Order overdue
- High priority order added

### Automated Actions:

- Auto-assign based on workload
- Auto-update production status based on actions
- Auto-send proof reminder if not approved in 48h
- Auto-mark as overdue
- Auto-create activity log entries

---

## 🎯 Phase 5: Reports & Analytics

### Reports:

**Daily:**
- Production schedule
- Orders to dispatch
- Payments to collect

**Weekly:**
- Revenue summary
- Orders completed
- Average turnaround time
- Top customers

**Monthly:**
- Full financial report
- Product performance
- Customer acquisition
- Operator performance

### Export Options:
- PDF reports
- Excel/CSV
- Print-friendly versions

---

## 🛠️ Implementation Priority

### HIGH PRIORITY (Do First):
1. ✅ Database migration
2. ✅ Production status field
3. ✅ Operator notes system
4. ✅ Sundries functionality
5. ✅ Priority system
6. ✅ Due date tracking

### MEDIUM PRIORITY:
7. Stripe payment status integration
8. Activity log display
9. Customer notes system
10. Proof approval workflow
11. Advanced filters
12. Assignment system

### LOW PRIORITY (Nice to Have):
13. Bulk operations
14. Email notifications
15. Reports & analytics
16. Customer relationship notes
17. Automated actions

---

## 💡 Additional Features to Consider

### Production Features:
- Print queue management
- Machine assignment (which printer)
- Material tracking (paper stock levels)
- Color calibration notes
- Finishing requirements checklist

### Customer Features:
- Repeat order button
- Template library
- Design upload tool
- Real-time pricing calculator
- Order chat/messaging

### Business Features:
- Quote generation
- Invoice generation
- Purchase order tracking
- Supplier management
- Inventory management

---

## 📱 Mobile Considerations

- Responsive design for tablets
- Mobile app for operators (scan, update status)
- QR code on orders for quick access
- Push notifications

---

## 🔒 Security & Permissions

**Admin:**
- Full access to everything
- Can delete orders
- Can issue refunds
- Can manage users

**Operator:**
- View all orders
- Update production status
- Add notes (operator & customer-facing)
- Add sundries
- Upload files
- Cannot delete orders
- Cannot issue refunds

**Customer:**
- View only their orders
- Add/edit customer notes
- Approve proofs
- View invoices
- Make payments

---

## 🎬 Next Steps

1. **Run the SQL migration** (`enhance-orders-table.sql`)
2. **Test the new fields** work in database
3. **Update the orders dashboard page** with new features
4. **Add API routes** for new functionality
5. **Test thoroughly**
6. **Deploy!**

---

Would you like me to start building the enhanced dashboard page now?
