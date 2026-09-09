cd /home/claude/smv-coaching-zone && echo "=== ১. route ফাইলটা সত্যিই আছে কিনা ===" 
find src/app/api/setup -type f
echo ""
echo "=== ২. ফাইলের ভেতরে সঠিক export আছে কিনা ===" 
grep -n "export async function" src/app/api/setup/init-admin/route.ts
echo ""
echo "=== ৩. login ও admin route আছে কিনা ===" 
find src/app/login src/app/admin -maxdepth 1 -type f
echo ""
echo "=== ৪. পুরো src/app এর top-level গঠন ===" 
find src/app -maxdepth 1
Output

=== ১. route ফাইলটা সত্যিই আছে কিনা ===
src/app/api/setup/init-admin/route.ts

=== ২. ফাইলের ভেতরে সঠিক export আছে কিনা ===
130:export async function GET(req: NextRequest) {
134:export async function POST(req: NextRequest) {

=== ৩. login ও admin route আছে কিনা ===
src/app/login/page.tsx
src/app/admin/page.tsx
src/app/admin/layout.tsx

=== ৪. পুরো src/app এর top-level গঠন ===
src/app
src/app/loading.tsx
src/app/admin
src/app/403
src/app/error.tsx
src/app/globals.css
src/app/api
src/app/not-found.tsx
src/app/dashboard-redirect
src/app/teacher
src/app/login
src/app/student
src/app/layout.tsx
src/app/(public)
