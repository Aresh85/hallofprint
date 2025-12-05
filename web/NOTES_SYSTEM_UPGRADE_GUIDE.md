# Notes System Upgrade Guide

## Overview
This guide explains how to upgrade the notes system to be append-only with activity log, and add artwork file link display.

---

## Changes Required

### 1. Database Migration
**Run these SQL files in Supabase (in order):**

1. `create-notes-activity-log.sql` - Creates the new `order_notes` table
2. The new table is append-only (notes cannot be deleted or edited)

### 2. Enhanced Orders Dashboard Updates

**File:** `web/app/admin/orders-enhanced/page.tsx`

#### A. Add Order Notes State & Loading

```typescript
// Add to type Order
order_notes?: Array<{
  id: string;
  note_type: string;
  note_content: string;
  created_by: string;
  created_at: string;
}>;
artwork_file_url?: string;
artwork_received?: boolean;

// Add to state
const [expandedNotes, setExpandedNotes] = useState<string | null>(null);
const [newNoteContent, setNewNoteContent] = useState('');
const [newNoteType, setNewNoteType] = useState<'internal' | 'about_customer'>('internal');
```

#### B. Update loadOrders Query

```typescript
const { data, error } = await supabase
  .from('orders')
  .select(`
    *,
    order_items (*),
    order_sundries (*),
    order_activity_log (*),
    order_notes (
      id,
      note_type,
      note_content,
      created_by,
      created_at
    )
  `)
  .order('created_at', { ascending: false });
```

#### C. Add Note Function

```typescript
const addNote = async (orderId: string, noteType: string, content: string) => {
  if (!content.trim()) {
    alert('Please enter a note');
    return;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('order_notes')
      .insert({
        order_id: orderId,
        note_type: noteType,
        note_content: content,
        created_by: user?.id
      });

    if (error) throw error;

    setNewNoteContent('');
    loadOrders();
    alert('Note added successfully!');
  } catch (error) {
    console.error('Error adding note:', error);
    alert('Failed to add note');
  }
};
```

#### D. Replace Notes Section

**Old:** Editable textarea boxes
**New:** Read-only note history + Add new note button

```tsx
{/* ARTWORK FILE LINK (if exists) */}
{order.artwork_received && order.artwork_file_url && (
  <div className="mb-4 pb-4 border-b bg-green-50 p-4 rounded-lg">
    <p className="text-xs font-semibold text-green-800 mb-2">📎 ARTWORK FILE</p>
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-900">{order.artwork_file_url}</p>
      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
        ✓ Received
      </span>
    </div>
    <p className="text-xs text-gray-500 mt-1">
      File was submitted via Web3Forms and is available in your email
    </p>
  </div>
)}

{/* NOTES SECTION - APPEND ONLY */}
<div className="grid md:grid-cols-2 gap-4 mb-4 pt-4 border-t">
  {/* Internal Notes History */}
  <div className="bg-red-50 p-3 rounded-lg">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs font-semibold text-red-800">🔒 INTERNAL NOTES</p>
      <button
        onClick={() => setExpandedNotes(expandedNotes === `internal-${order.id}` ? null : `internal-${order.id}`)}
        className="text-xs text-red-600 hover:text-red-800"
      >
        {expandedNotes === `internal-${order.id}` ? 'Hide' : 'View All'} 
        ({order.order_notes?.filter(n => n.note_type === 'internal').length || 0})
      </button>
    </div>
    
    {expandedNotes === `internal-${order.id}` ? (
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {order.order_notes
          ?.filter(n => n.note_type === 'internal')
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map((note) => (
            <div key={note.id} className="bg-white p-2 rounded border-l-4 border-red-500">
              <p className="text-sm text-gray-900">{note.note_content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(note.created_at)} by {getUserName(note.created_by)}
              </p>
            </div>
          ))}
        {(!order.order_notes || order.order_notes.filter(n => n.note_type === 'internal').length === 0) && (
          <p className="text-sm text-gray-500">No internal notes yet</p>
        )}
      </div>
    ) : (
      <>
        {order.order_notes?.filter(n => n.note_type === 'internal')[0] ? (
          <div className="bg-white p-2 rounded">
            <p className="text-sm text-gray-900">
              {order.order_notes.filter(n => n.note_type === 'internal')[0].note_content}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Most recent note
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No notes yet</p>
        )}
      </>
    )}
    
    {/* Add New Note */}
    <div className="mt-3 pt-3 border-t border-red-200">
      <textarea
        value={newNoteType === 'internal' && newNoteContent}
        onChange={(e) => {
          setNewNoteType('internal');
          setNewNoteContent(e.target.value);
        }}
        placeholder="Add a new internal note..."
        className="w-full p-2 text-sm border rounded mb-2"
        rows={2}
      />
      <button
        onClick={() => {
          addNote(order.id, 'internal', newNoteContent);
        }}
        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
      >
        + Add Note
      </button>
    </div>
  </div>

  {/* About Customer Notes History */}
  <div className="bg-purple-50 p-3 rounded-lg">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs font-semibold text-purple-800">📝 ABOUT CUSTOMER</p>
      <button
        onClick={() => setExpandedNotes(expandedNotes === `customer-${order.id}` ? null : `customer-${order.id}`)}
        className="text-xs text-purple-600 hover:text-purple-800"
      >
        {expandedNotes === `customer-${order.id}` ? 'Hide' : 'View All'}
        ({order.order_notes?.filter(n => n.note_type === 'about_customer').length || 0})
      </button>
    </div>
    
    {expandedNotes === `customer-${order.id}` ? (
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {order.order_notes
          ?.filter(n => n.note_type === 'about_customer')
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map((note) => (
            <div key={note.id} className="bg-white p-2 rounded border-l-4 border-purple-500">
              <p className="text-sm text-gray-900">{note.note_content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(note.created_at)} by {getUserName(note.created_by)}
              </p>
            </div>
          ))}
        {(!order.order_notes || order.order_notes.filter(n => n.note_type === 'about_customer').length === 0) && (
          <p className="text-sm text-gray-500">No customer notes yet</p>
        )}
      </div>
    ) : (
      <>
        {order.order_notes?.filter(n => n.note_type === 'about_customer')[0] ? (
          <div className="bg-white p-2 rounded">
            <p className="text-sm text-gray-900">
              {order.order_notes.filter(n => n.note_type === 'about_customer')[0].note_content}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Most recent note
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No notes yet</p>
        )}
      </>
    )}
    
    {/* Add New Note */}
    <div className="mt-3 pt-3 border-t border-purple-200">
      <textarea
        value={newNoteType === 'about_customer' && newNoteContent}
        onChange={(e) => {
          setNewNoteType('about_customer');
          setNewNoteContent(e.target.value);
        }}
        placeholder="Add a note about this customer..."
        className="w-full p-2 text-sm border rounded mb-2"
        rows={2}
      />
      <button
        onClick={() => {
          addNote(order.id, 'about_customer', newNoteContent);
        }}
        className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
      >
        + Add Note
      </button>
    </div>
  </div>
</div>

{/* Customer Notes (Read-only from form submission) */}
{order.customer_notes && (
  <div className="mb-4 bg-blue-50 p-3 rounded-lg">
    <p className="text-xs font-semibold text-blue-800 mb-2">👤 CUSTOMER SUBMITTED NOTES</p>
    <p className="text-sm text-gray-700">{order.customer_notes}</p>
  </div>
)}
```

---

### 3. Artwork Dashboard Updates

**File:** `web/app/admin/artwork-dashboard/page.tsx`

Add file link display in the submission details:

```tsx
{/* After customer phone display */}
<div>
  <p className="text-xs text-gray-500 mb-1">File Link</p>
  <p className="text-sm text-blue-600 break-all">
    File attached to Web3Forms email
  </p>
  <p className="text-xs text-gray-500 mt-1">
    Check your email for: {submission.file_name}
  </p>
</div>
```

---

## Key Features

### Append-Only Notes
- ✅ Cannot edit or delete existing notes
- ✅ Can only add new notes
- ✅ Full history preserved
- ✅ Each note has timestamp and author

### Notes Activity Timeline
- ✅ View all notes in chronological order
- ✅ Separate timelines for Internal and Customer notes
- ✅ Expandable/collapsible view
- ✅ Shows who added each note and when

### Artwork File Access
- ✅ Display artwork file name when received
- ✅ Note that file is in Web3Forms email
- ✅ Green badge showing "Received" status
- ✅ Visible in both orders dashboard and artwork dashboard

---

## Web3Forms Email

When artwork is submitted via Web3Forms, you'll receive an email with:
- Customer details
- File attachment (the actual artwork file)
- Order linkage information
- All form fields

**To Access Files:**
1. Check email sent to your Web3Forms configured address
2. Download attachment from email
3. Upload to your preferred storage if needed

---

## Benefits

1. **Complete Audit Trail** - Every note ever added is preserved
2. **No Accidental Deletions** - Old notes can't be edited or removed
3. **Clear History** - See exactly when and who added each note
4. **Flexible** - Add as many notes as needed over time
5. **Organized** - Separate timelines for different note types

---

## Migration Path

If you have existing notes in the old format:

```sql
-- Migrate existing operator notes
INSERT INTO order_notes (order_id, note_type, note_content, created_by)
SELECT 
  id as order_id,
  'internal' as note_type,
  operator_notes as note_content,
  operator_notes_updated_by as created_by
FROM orders
WHERE operator_notes IS NOT NULL AND operator_notes != '';

-- Migrate existing customer notes
INSERT INTO order_notes (order_id, note_type, note_content, created_by)
SELECT 
  id as order_id,
  'about_customer' as note_type,
  operator_customer_notes as note_content,
  operator_customer_notes_updated_by as created_by
FROM orders
WHERE operator_customer_notes IS NOT NULL AND operator_customer_notes != '';
```

---

## Testing

1. Run SQL migrations
2. Add a new note to an order
3. Verify it appears in timeline
4. Try to edit - should not be possible
5. Add another note - both should show
6. Check artwork file display when artwork is uploaded

---

## Summary

**What Changes:**
- Notes become append-only (add new, never edit)
- Each note has full audit trail
- Artwork files show up with links/info
- Better organization and history

**What Stays the Same:**
- All other order management features
- Activity log for other actions
- Sundries, assignments, etc.

**Result:**
- Professional note-keeping system
- Complete history
- Better accountability
- Easier file access
