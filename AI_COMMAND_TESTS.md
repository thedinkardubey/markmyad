# AI Command Testing Guide

## 🧪 Comprehensive Test Prompts for Gemini AI RBAC Commands

### ✅ **BASIC FUNCTIONALITY TESTS**

#### 1. Create Permission
```
create a permission called manage_settings
create permission delete_posts
make a new permission view_analytics
```

#### 2. Create Role
```
create a role called moderator
create role guest
make a new role called premium_user
```

#### 3. Assign Permission (Basic)
```
assign reader the permission can_read_articles
give administrator the permission can_delete_users
add the permission can_edit_articles to Content Editor
```

#### 4. List Operations
```
list all roles
show me all permissions
list permissions
what roles exist?
```

#### 5. Describe Role
```
describe role administrator
show me details of Content Editor
what permissions does reader have?
```

---

### 🔥 **CRITICAL EDGE CASES TO TEST**

#### 6. **Duplicate Assignment Prevention** ⚠️
```
assign reader the permission can_read_articles
```
Then try again:
```
assign reader the permission can_read_articles
```
**Expected**: Should return error that permission is already assigned

#### 7. **Non-Existent Role**
```
assign nonexistent_role the permission can_read_articles
give fake_role the permission users:read
```
**Expected**: Should return 404 with AI suggestions to create the role first

#### 8. **Non-Existent Permission**
```
assign reader the permission fake_permission
give administrator permission does_not_exist
```
**Expected**: Should return 404 with AI suggestions to create the permission first

#### 9. **Case Insensitivity**
```
assign READER the permission CAN_READ_ARTICLES
give AdMiNiStRaToR the permission USERS:READ
describe role CONTENT EDITOR
```
**Expected**: Should work correctly (case-insensitive matching)

#### 10. **Special Characters in Names** ⚠️
```
create permission users:read:all
create permission can-edit-posts
create role super-admin
assign super-admin the permission users:read:all
```
**Expected**: Should handle underscores, hyphens, colons properly

#### 11. **Duplicate Creation** ⚠️
```
create permission can_read_articles
```
Then try again:
```
create permission can_read_articles
```
**Expected**: Should return error that item already exists with suggestions

#### 12. **Ambiguous Commands** ⚠️
```
assign something
give role permission
create
permission
```
**Expected**: Should return low confidence error with suggestions

#### 13. **Remove Permission (Not in original spec)**
```
remove can_read_articles from reader
revoke administrator permission users:delete
take away the permission users:write from Support Agent
```
**Expected**: Should remove the assignment if it exists

#### 14. **Multiple Word Names with Spaces** ⚠️
```
create role "Senior Content Editor"
create permission "can manage all users"
assign "Senior Content Editor" the permission "can manage all users"
```
**Expected**: Currently might fail - names with spaces need proper handling

#### 15. **Empty or Null Commands**
```
(empty string)
   
null
```
**Expected**: Should return 400 error "Command is required"

#### 16. **Very Long Commands** ⚠️
```
I would really like to create a brand new permission that allows users to edit and modify and update all the articles in the system and I want to call it edit_articles please
```
**Expected**: Should still extract the intent correctly

#### 17. **Numeric Names** ⚠️
```
create role 12345
create permission 999
assign 12345 the permission 999
```
**Expected**: Should handle or reject appropriately

#### 18. **SQL Injection Attempts** 🔒
```
create role '; DROP TABLE roles; --
assign admin'; DELETE FROM permissions; -- the permission test
```
**Expected**: Prisma should prevent SQL injection, but test to be sure

#### 19. **XSS Attempts** 🔒
```
create permission <script>alert('xss')</script>
create role <img src=x onerror=alert(1)>
```
**Expected**: Should be sanitized or rejected

#### 20. **Unicode and Special Characters** 🌍
```
create role 管理员
create permission читать_статьи
create role emoji_role_😀
assign 管理员 the permission читать_статьи
```
**Expected**: Should handle or gracefully reject

#### 21. **Multiple Commands in One** ⚠️
```
create role editor and assign it the permission edit_posts
first create permission view_dashboard then assign it to admin
```
**Expected**: Currently not supported - should return unclear command error

#### 22. **Negative Commands**
```
don't create permission test
never assign reader any permissions
remove all permissions from everyone
```
**Expected**: Should handle gracefully with suggestions

#### 23. **Questions Instead of Commands**
```
can you create a permission?
should I assign reader the can_read_articles permission?
is it possible to list all roles?
```
**Expected**: Should still understand intent or provide suggestions

#### 24. **Typos and Misspellings** ⚠️
```
asign reeder the permision can_read_articls
crete a roel called edittor
giv administrator the permision users:delet
```
**Expected**: Gemini should be smart enough to understand, or fallback parser might fail

#### 25. **Removing Non-Existent Assignment** ⚠️
```
remove users:write from reader
```
(where reader never had this permission)
**Expected**: Should handle gracefully - currently might succeed silently

---

## 🎯 **PRIORITY TEST SEQUENCE**

### Phase 1: Happy Path
1. ✅ Basic create permission
2. ✅ Basic create role  
3. ✅ Basic assign permission
4. ✅ List and describe operations

### Phase 2: Critical Validations
5. ⚠️ Duplicate assignment (TEST #6)
6. ⚠️ Non-existent role (TEST #7)
7. ⚠️ Non-existent permission (TEST #8)
8. ⚠️ Duplicate creation (TEST #11)

### Phase 3: Edge Cases
9. ⚠️ Case insensitivity (TEST #9)
10. ⚠️ Special characters (TEST #10)
11. ⚠️ Ambiguous commands (TEST #12)
12. ⚠️ Names with spaces (TEST #14)

### Phase 4: Security
13. 🔒 SQL injection attempts (TEST #18)
14. 🔒 XSS attempts (TEST #19)

---

## 📝 **MISSING FEATURES IDENTIFIED**

1. ❌ **Bulk operations**: "assign reader all read permissions"
2. ❌ **Conditional logic**: "assign editor the permission edit_posts if it exists"
3. ❌ **Pattern matching**: "list all permissions starting with users:"
4. ❌ **Batch commands**: Multiple commands in one request
5. ❌ **Undo/rollback**: "undo last command"
6. ❌ **Validation for names with spaces** (currently might fail)
7. ❌ **Better error recovery** for typos in entity names

---

## 🚀 **HOW TO TEST**

### Using cURL:
```bash
curl -X POST http://localhost:3000/api/ai-command \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_AUTH_TOKEN" \
  -d '{"command": "assign reader the permission can_read_articles"}'
```

### Expected Response Format:
```json
{
  "success": true,
  "message": "Permission 'can_read_articles' assigned to role 'reader'",
  "data": { "id": 1, "roleId": 2, "permissionId": 3 },
  "confidence": 0.95
}
```

### Error Response Format:
```json
{
  "success": false,
  "error": "Role 'nonexistent_role' not found",
  "suggestions": [
    "Create the role first using: create role nonexistent_role",
    "Check if the role name is spelled correctly",
    "Use 'list all roles' to see existing roles"
  ]
}
```

---

## 🐛 **KNOWN ISSUES TO FIX**

1. ⚠️ **Duplicate assignments** - Now fixed with duplicate check
2. ⚠️ **Names with spaces** - Regex parser won't handle quotes properly
3. ⚠️ **Silent success on remove non-existent** - Should check if assignment exists first
4. ⚠️ **Double body parsing on P2002 error** - Need to cache the body
5. ⚠️ **No rate limiting** - Could spam Gemini API
6. ⚠️ **No audit logging** - Who executed what command when?
