
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);   

const addBtn = $('.add-btn')
const addTaskModal = $('#addTaskModal')
const closeBtn = $('.btn-close-modal')
const titleInput = $('#title')
const taskForm = $('.todo-app-form')
const listTasks = $('.task-list-container')
const completeBtn = $('.btn-complete')


//array task
const todoTasks = [
    {
        id: Date.now() + 1, // Dùng Date.now() để có ID duy nhất
        title: 'Ví dụ: Hoàn thành bài tập',
        description: 'Đây là một công việc đã hoàn thành.',
        category: 'Học tập',
        priority: 'High',
        startTime: '',
        endTime: '',
        DueDate: '2025-06-12',
        cardColor: 'bg-green',
        isCompleted: true // Đặt trạng thái đã hoàn thành
    },
    {
        id: Date.now() + 2,
        title: 'Ví dụ: Đi chợ',
        description: 'Đây là một công việc chưa hoàn thành.',
        category: 'Cá nhân',
        priority: 'Medium',
        startTime: '',
        endTime: '',
        DueDate: '2025-06-11',
        cardColor: 'bg-blue',
        isCompleted: false
    }
];

//Xử lý đóng mở
addBtn.addEventListener("click", () => {
    addTaskModal.className = "modal-overlay show";

    //focus vào title
    titleInput.focus()
  });

closeBtn.addEventListener("click", () => {
    addTaskModal.className = "modal-overlay";
  });

taskForm.addEventListener('submit', (event) => {
    event.preventDefault()

    const title = $('#title').value;
    const description = $('#description').value;
    const category = $('#category').value;
    const priority = $('#priority').value;
    const startTime = $('#startTime').value;
    const endTime = $('#endTime').value;
    const dueDate = $('#dueDate').value;
    const cardColor = $('input[name="cardColor"]:checked').value

    const newTask = { 
            id: Date.now(),
            title: title,
            description: description,
            category: category,
            priority: priority,
            startTime: startTime,
            endTime: endTime,
            DueDate: dueDate, 
            cardColor: cardColor,
            isCompleted: false 
    }

    todoTasks.unshift(newTask)
    renderTasks()
    taskForm.reset()
    addTaskModal.className = "modal-overlay"
})

listTasks.addEventListener('click', (event) => {
    const completeButton = event.target.closest('.btn-complete');

    if (!completeButton) {
        return;
    }

    const taskCard = event.target.closest('.task-card');
    const taskId = Number(taskCard.dataset.id);

    const taskToUpdate = todoTasks.find(task => task.id === taskId);

    if (taskToUpdate) {
        taskToUpdate.isCompleted = !taskToUpdate.isCompleted;
        renderTasks(); // Gọi render sau khi đã thay đổi dữ liệu
    }
});

window.addEventListener('load', renderTasks);

function renderTasks() {
    listTasks.innerHTML = '';
    
    todoTasks.forEach((task) => {
        const taskCardHTML = `
        <div class="task-card ${task.isCompleted ? 'completed' : ''}" data-id="${task.id}">
            <div class="task-header ${task.cardColor}">
                <h3 class="task-title">${task.title}</h3>
                <div class="task-actions">
                    
                    <button class="action-btn btn-complete">
                        ${task.isCompleted 
                            ? '<i class="fa-solid fa-circle-check"></i>' 
                            : '<i class="fa-regular fa-circle"></i>'
                        }
                    </button>

                    <button class="action-btn"><i class="fa-solid fa-pen"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <div class="task-body">
                <p class="task-description">${task.description}</p>
                <div class="task-meta">
                    <span class="task-category">${task.category}</span>
                    <span class="task-priority ${task.priority.toLowerCase()}">${task.priority}</span>
                </div>
            </div>
            <div class="task-footer">
                <span class="task-due-date">Due: ${task.DueDate}</span>
            </div>
        </div>
    `;
        listTasks.innerHTML += taskCardHTML;
    });
}
