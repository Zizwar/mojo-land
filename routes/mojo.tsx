

import { useState } from 'preact/hooks';


const generateRandomDate = () => {
  const year = Math.floor(Math.random() * 3) + 2021;
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const generateRandomProjects = () => {
  const projects = [];
  for (let i = 1; i <= 5; i++) {
    projects.push({
      name: `Project ${i}`,
      completed: Math.random() < 0.5,
      task: `Task ${i}`,
      date: generateRandomDate()
    });
  }
  return projects;
};
export default function Sa() {
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [projects, setProjects] = useState(generateRandomProjects());

  const [selectedProjectIndex, setSelectedProjectIndex] = useState(null);

  const openDeleteModal = (index) => {
    setSelectedProjectIndex(index);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedProjectIndex(null);
    setIsDeleteModalOpen(false);
  };


  return (
    <div class="bg-gray-100 p-8">
      <div class="max-w-md mx-auto bg-white p-6 rounded-md shadow-md">
        <h1 class="text-xl font-semibold mb-4">Striped Table</h1>
        <table class="w-full border-collapse">
          <thead>
            <tr>
              <th class="py-2 px-4 border">Project</th>
              <th class="py-2 px-4 border">Completed</th>
              <th class="py-2 px-4 border">Task</th>
              <th class="py-2 px-4 border">Date</th>
              <th class="py-2 px-4 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => (
              <tr class={index % 2 === 0 ? 'bg-gray-200' : ''}>
                <td class="py-2 px-4 border">{project.name}</td>
                <td class="py-2 px-4 border">
                  <i class={project.completed ? 'fas fa-check text-green-500' : 'fas fa-times text-red-500'}></i>
                </td>
                <td class="py-2 px-4 border">{project.task}</td>
                <td class="py-2 px-4 border">{project.date}</td>
                <td class="py-2 px-4 border">
                  <button class="text-blue-500 hover:text-blue-700"><i class="fas fa-edit">edit</i></button>
                  <button class="text-red-500 hover:text-red-700 ml-2" onClick={() => openDeleteModal(index)}>
                 del<i class="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isDeleteModalOpen && (
        <div class="fixed inset-0 flex justify-center items-center z-10 bg-gray-500 bg-opacity-50">
          <div class="bg-white p-6 rounded-md shadow-md max-w-md">
            <p class="mb-4">هل أنت متأكد من رغبتك في حذف هذا العنصر؟</p>
            <input type="text" placeholder="أكتب 'نعم' للتأكيد" class="w-full border p-2 mb-4" />
            <div class="flex justify-end">
              <button class="bg-red-500 text-white px-4 py-2 rounded-md">حذف</button>
              <button class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md ml-2" onClick={closeDeleteModal}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



