export default function Admin() {
  /*
  const handleSubmit = async (event: { preventDefault: () => void; target: HTMLFormElement|undefined; }) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = {};

    formData.forEach((value, key) => {
      data[key] = value;
    });
    console.log({ data });
    try {
      const response = await fetch("/api/mojo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log("تم إرسال البيانات بنجاح");
      } else {
        console.error("حدث خطأ أثناء إرسال البيانات");
      }
    } catch (error) {
      console.error("حدث خطأ أثناء الاتصال بالخادم", error);
    }
  };
  */
  //
  const FormField = ({ name, label, type }) => {
    const id = `field-${name}`;
    return (
      <div class="mb-4">
        <div class="flex justify-between">
          <label class="block text-gray-700 text-sm font-bold mb-2" for={id}>
            {name}
          </label>
          <label class="block text-gray-700 text-sm font-bold mb-2" for={id}>
            {label}
          </label>
        </div>
        {type === "checkbox" ? (
          <input
            class="mr-2 leading-tight"
            type="checkbox"
            id={id}
            name={name}
          />
        ) : type === "textarea" ? (
          <textarea
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id={id}
            name={name}
            rows="3"
          />
        ) : (
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id={id}
            type={type}
            name={name}
          />
        )}
      </div>
    );
  };
  const fields = [
    { name: "status", label: "الحالة", type: "text" },
    { name: "title_ar", label: "العنوان (عربي)", type: "text" },
    { name: "title_en", label: "العنوان (إنجليزي)", type: "text" },
    { name: "comment", label: "التعليق", type: "textarea" },
    { name: "method", label: "الطريقة", type: "text" },
    { name: "endpoint", label: "النقطة النهائية", type: "text" },
    { name: "table", label: "الجدول", type: "text" },
    { name: "columns", label: "الأعمدة", type: "text" },
    { name: "prefix", label: "البادئة", type: "text" },
    { name: "single", label: "واحد فقط", type: "checkbox" },

    { name: "role", label: "الدور", type: "text" },
    { name: "filters", label: "الفلاتر", type: "textarea" },
    { name: "select", label: "الاختيار", type: "text" },
    { name: "function", label: "الدالة", type: "textarea" },
    { name: "rpc", label: "RPC", type: "text" },
    { name: "data", label: "البيانات", type: "textarea" },
    { name: "raw", label: "استعلام مخصص", type: "text" },
    { name: "log", label: "السجل", type: "checkbox" },
  ];

  return (
    <>
      <div class="bg-gray-100 p-4">
        <div class="max-w-md mx-auto bg-white p-4 rounded shadow-md">
          <h2 class="text-xl font-semibold mb-4">Mojo Land</h2>
          <div class="p-4">
            <form class="bg-white shadow-md rounded px-4 pt-6 pb-8 mb-4">
              {fields.map((field) => (
                <FormField
                  name={field.name}
                  label={field.label}
                  type={field.type}
                  key={field.name}
                />
              ))}
              <div class="flex items-center justify-between mt-4">
                <button
                  class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <script src="/js/mojo-form.js"></script>
    </>
  );
}
