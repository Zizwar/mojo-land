import { useEffect } from "preact/hooks";
export default function Edit({ data: { data = [] } }) {
  console.log("datatatat,", data);
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const dataSubmit = {token:"",uuid:""};

    for (let [name, value] of formData.entries()) {
      if (value) dataSubmit[name] = value;
    }
    const token = dataSubmit["token"];
    delete dataSubmit.token
    
    const UUID = dataSubmit.uuid;

dataSubmit.permissions = JSON.parse(dataSubmit.permissions);

    console.log("start", { token,UUID, dataSubmit });

    const urlFetch = UUID
      ? `/api/mojo-update?token=${token}&uuid=${UUID}`
      : `/api/abrakadabra?token=${token}`;
    try {
      const response = await fetch(urlFetch, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataSubmit),
      });

      const responseData = await response.json();
      alert(JSON.stringify({ responseData }));
      // Handle response from the API
    } catch (error) {
      alert(JSON.stringify({ error }));
      // Handle error
    }
  };
  //
  const FormField = ({ name, label, type, icon }) => {
    const id = `field-${name}`;
    return (
      <div class="mb-4">
        <div class="flex justify-between">
          <label class="block text-gray-700 text-sm font-bold mb-2" for={id}>
            {icon && <i class={`fas ${icon} mr-1`}></i>} {name}
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
            checked={!!data[name]}
          />
        ) : type === "textarea" ? (
          <textarea
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id={id}
            name={name}
            rows={3}
            value={data[name]==="permissions" ? JSON.stringify(data [name]): data [name])}
          />
        ) : (
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id={id}
            type={type}
            name={name}
            value={data[name]}
          />
        )}
      </div>
    );
  };
  ///

  const fields = [
    { name: "token", label: "توكن", type: "text", icon: "fa-key" },
    { name: "status", label: "الحالة", type: "text", icon: "fa-flag" },
    {
      name: "title_ar",
      label: "العنوان (عربي)",
      type: "text",
      icon: "fa-heading",
    },
    {
      name: "title_en",
      label: "العنوان (إنجليزي)",
      type: "text",
      icon: "fa-heading",
    },
    { name: "comment", label: "التعليق", type: "textarea", icon: "fa-comment" },
    { name: "method", label: "الطريقة", type: "text", icon: "fa-code" },
    {
      name: "endpoint",
      label: "النقطة النهائية",
      type: "text",
      icon: "fa-link",
    },
    { name: "table", label: "الجدول", type: "text", icon: "fa-table" },
    { name: "columns", label: "الأعمدة", type: "text", icon: "fa-columns" },
    { name: "prefix", label: "البادئة", type: "text", icon: "fa-code-branch" },
    {
      name: "single",
      label: "واحد فقط",
      type: "checkboxcer",
      icon: "fa-circle-o-notch",
    },

    { name: "role", label: "الدور", type: "text", icon: "fa-user" },
    { name: "filters", label: "الفلاتر", type: "textarea", icon: "fa-filter" },
    {
      name: "select",
      label: "الاختيار",
      type: "text",
      icon: "fa-hand-pointer",
    },  
{ name: "permissions", label: "التصاريح", type: "textarea", icon: "fa-key" },
    { name: "function", label: "الدالة", type: "textarea", icon: "fa-code" },
    { name: "rpc", label: "RPC", type: "text", icon: "fa-network-wired" },

{ name: "text", label: "النص", type: "textarea", icon: "fa-note" },    { name: "data", label: "البيانات", type: "textarea", icon: "fa-database" },
    { name: "sql", label: "استعلام مخصص", type: "text", icon: "fa-terminal" },
    { name: "log", label: "السجل", type: "checkbox", icon: "fa-file-alt" },
  ];

  return (
    <>
      <div class="bg-gray-100 p-4">
        <div class="max-w-md mx-auto bg-white p-4 rounded shadow-md">
          <h2 class="text-xl font-semibold mb-4">Mojo Land</h2>
          <div class="p-4">
            <form
              onSubmit={handleSubmit}
              class="bg-white shadow-md rounded px-4 pt-6 pb-8 mb-4"
            >
              {fields.map((field) => (
                <FormField
                  name={field.name}
                  label={field.label}
                  type={field.type}
                  icon={field.icon}
                  key={field.name}
                />
              ))}
              <div class="flex items-center justify-between mt-4">
                <input name="uuid" type="hidden" value={data["uuid"]} />
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
    </>
  );
}
