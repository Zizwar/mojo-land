export default function Sa() {
  /**
   * document.querySelector('form').addEventListener('submit', function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = {};

  for (let [name, value] of formData.entries()) {
    data[name] = value;
  }

  fetch('api/mojo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then((response) => response.json())
    .then((data) => {
      // Handle response from the API
    })
    .catch((error) => {
      // Handle error
    });
});

   */
  return (
    <>
      <div class="max-w-4xl mx-aut" style="direction:rtl">
        <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="id">
              ID
            </label>
            <input
              id="id"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="id"
              type="text"
              placeholder="ادخل ID"
            />
          </div>
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="created_at"
            >
              تاريخ الإنشاء
            </label>
            <input
              id="created_at"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="created_at"
              type="text"
              placeholder="ادخل تاريخ الإنشاء"
            />
          </div>
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="updated_at"
            >
              تاريخ التحديث
            </label>
            <input
              id="updated_at"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="updated_at"
              type="text"
              placeholder="ادخل تاريخ التحديث"
            />
          </div>
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="updated_by"
            >
              المحدث
            </label>
            <input
              id="updated_by"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="updated_by"
              type="text"
              placeholder="ادخل المحدث"
            />
          </div>
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="status"
            >
              الحالة
            </label>
            <input
              id="status"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="status"
              type="text"
              placeholder="ادخل الحالة"
            />
          </div>
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="title_ar"
            >
              العنوان بالعربية
            </label>
            <input
              id="title_ar"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="title_ar"
              type="text"
              placeholder="ادخل العنوان بالعربية"
            />
          </div>
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="title_en"
            >
              العنوان بالإنجليزية
            </label>
            <input
              id="title_en"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="title_en"
              type="text"
              placeholder="ادخل العنوان بالإنجليزية"
            />
          </div>
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="columns"
            >
              الأعمدة
            </label>
            <input
              id="columns"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="columns"
              type="text"
              placeholder="ادخل الأعمدة"
            />
          </div>
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="table"
            >
              الجدول
            </label>
            <input
              id="table"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="table"
              type="text"
              placeholder="ادخل الجدول"
            />
          </div>
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="prefix"
            >
              البادئة
            </label>
            <input
              id="prefix"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="prefix"
              type="text"
              placeholder="ادخل البادئة"
            />
          </div>
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="endpoint"
            >
              النهاية
            </label>
            <input
              id="endpoint"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="endpoint"
              type="text"
              placeholder="ادخل النهاية"
            />
          </div>
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="comment"
            >
              التعليق
            </label>
            <input
              id="comment"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="comment"
              type="text"
              placeholder="ادخل التعليق"
            />
          </div>
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="data"
            >
              البيانات
            </label>
            <input
              id="data"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="data"
              type="text"
              placeholder="ادخل البيانات"
            />
          </div>
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="permissions"
            >
              الصلاحيات
            </label>
            <input
              id="permissions"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="permissions"
              type="text"
              placeholder="ادخل الصلاحيات"
            />
          </div>
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="custom_sql"
            >
              SQL مخصص
            </label>
            <input
              id="custom_sql"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="custom_sql"
              type="text"
              placeholder="ادخل SQL مخصص"
            />
          </div>
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="function"
            >
              الدالة
            </label>
            <input
              id="function"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="function"
              type="text"
              placeholder="ادخل الدالة"
            />
          </div>
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="role"
            >
              الدور
            </label>
            <input
              id="role"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="role"
              type="text"
              placeholder="ادخل الدور"
            />
          </div>
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="method"
            >
              الطريقة
            </label>
            <input
              id="method"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="method"
              type="text"
              placeholder="ادخل الطريقة"
            />
          </div>
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="select"
            >
              الاستعلام
            </label>
            <input
              id="select"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="select"
              type="text"
              placeholder="ادخل الاستعلام"
            />
          </div>
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="uuid"
            >
              UUID
            </label>
            <input
              id="uuid"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="uuid"
              type="text"
              placeholder="ادخل UUID"
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="rpc">
              RPC
            </label>
            <input
              id="rpc"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="rpc"
              type="text"
              placeholder="ادخل RPC"
            />
          </div>
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="single"
            >
              واحد
            </label>
            <input
              id="single"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="single"
              type="text"
              placeholder="ادخل واحد"
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="log">
              تسجيل
            </label>
            <input
              id="log"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="log"
              type="text"
              placeholder="ادخل تسجيل"
            />
          </div>
          <div class="flex items-center justify-between">
            <button
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              ارسال
            </button>
          </div>
        </form>
        <script src="/js/mojo-form.js"></script>
      </div>
    </>
  );
}
